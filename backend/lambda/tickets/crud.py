import json
import os
import sys
import uuid
import qrcode
import io
import base64
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import put_item, get_item, query_items, convert_floats
from boto3.dynamodb.conditions import Key, Attr

TABLE_TICKETS = os.environ.get('TABLE_TICKETS', 'limajs-tickets')
TABLE_SUBSCRIPTIONS = os.environ.get('TABLE_SUBSCRIPTIONS', 'limajs-subscriptions')

def lambda_handler(event, context):
    """
    Handler pour Tickets (QR Codes).
    Routes:
    - POST /tickets/generate -> Générer un QR code pour un voyage
    - POST /tickets/validate -> Valider un QR code (chauffeur)
    - GET /tickets/history -> Historique de mes tickets
    """
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    
    try:
        if '/generate' in path and http_method == 'POST':
            return generate_ticket(event)
        elif '/validate' in path and http_method == 'POST':
            return validate_ticket(event)
        elif '/history' in path and http_method == 'GET':
            return get_ticket_history(event)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def generate_ticket(event):
    """Générer un QR code pour un voyage."""
    body = json.loads(event.get('body', '{}'))
    
    # Récupérer userId
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_sub = claims.get('sub')
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    user_id = f"USER#{user_sub}"
    
    # Vérifier abonnement actif
    subscriptions = query_items(
        TABLE_SUBSCRIPTIONS,
        Key('userId').eq(user_id),
        Attr('status').eq('ACTIVE') & Attr('endDate').gte(datetime.utcnow().isoformat())
    )
    
    if not subscriptions:
        return error(403, "No active subscription. Please subscribe first.")
    
    # Générer ticket
    ticket_id = str(uuid.uuid4())
    created_at = datetime.utcnow()
    expires_at = created_at + timedelta(minutes=15)  # Ticket valide 15 min
    
    ticket_item = convert_floats({
        'ticketId': ticket_id,
        'createdAt': created_at.isoformat(),
        'userId': user_id,
        'subscriptionId': subscriptions[0]['subscriptionId'],
        'status': 'ACTIVE',  # ACTIVE, USED, EXPIRED
        'ttl': int(expires_at.timestamp()),  # Pour auto-suppression DynamoDB
        'routeId': body.get('routeId'),  # Optionnel
        'validatedAt': None,
        'validatedBy': None
    })
    
    put_item(TABLE_TICKETS, ticket_item)
    
    # Générer QR Code
    qr_data = json.dumps({
        'ticketId': ticket_id,
        'userId': user_id,
        'exp': expires_at.isoformat()
    })
    
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convertir en base64 pour retour JSON
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return success({
        'ticket': ticket_item,
        'qrCode': f"data:image/png;base64,{img_base64}",
        'expiresAt': expires_at.isoformat()
    }, "Ticket generated successfully")

def validate_ticket(event):
    """Valider un QR code (Chauffeur scanne)."""
    body = json.loads(event.get('body', '{}'))
    
    ticket_id = body.get('ticketId')
    if not ticket_id:
        return error(400, "ticketId is required")
    
    # Récupérer driver ID
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    driver_sub = claims.get('sub')
    
    if not driver_sub:
        return error(401, "Unauthorized")
    
    # Query ticket
    tickets = query_items(
        TABLE_TICKETS,
        Key('ticketId').eq(ticket_id)
    )
    
    if not tickets:
        return error(404, "Ticket not found or expired")
    
    ticket = tickets[0]
    
    # Vérifier statut
    if ticket['status'] != 'ACTIVE':
        return error(400, f"Ticket already {ticket['status']}")
    
    # Marquer comme utilisé
    from shared.db import update_item
    updated = update_item(
        TABLE_TICKETS,
        {'ticketId': ticket_id, 'createdAt': ticket['createdAt']},
        "SET #status = :status, validatedAt = :validated, validatedBy = :driver",
        {
            ':status': 'USED',
            ':validated': datetime.utcnow().isoformat(),
            ':driver': f"USER#{driver_sub}"
        },
        {'#status': 'status'}
    )
    
    return success({
        'ticket': updated,
        'passenger': ticket['userId']
    }, "Ticket validated successfully")

def get_ticket_history(event):
    """Historique des tickets d'un utilisateur."""
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_sub = claims.get('sub')
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    user_id = f"USER#{user_sub}"
    
    # Query avec GSI user-tickets-index
    tickets = query_items(
        TABLE_TICKETS,
        Key('userId').eq(user_id),
        index_name='user-tickets-index'
    )
    
    return success({'tickets': tickets, 'count': len(tickets)})

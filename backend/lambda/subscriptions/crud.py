import json
import os
import sys
import uuid
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import put_item, get_item, query_items, scan_items, convert_floats
from boto3.dynamodb.conditions import Key, Attr

TABLE_SUBSCRIPTIONS = os.environ.get('TABLE_SUBSCRIPTIONS', 'limajs-subscriptions')

def lambda_handler(event, context):
    """
    Handler pour Subscriptions (Abonnements).
    Routes:
    - GET /subscriptions/types -> Types d'abonnements disponibles
    - POST /subscriptions -> Demander un abonnement
    - GET /subscriptions/active -> Mon abonnement actif
    - GET /subscriptions/{userId} -> Abonnements d'un user (admin)
    """
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    path_parameters = event.get('pathParameters') or {}
    
    try:
        if '/types' in path and http_method == 'GET':
            return get_subscription_types()
        elif '/active' in path and http_method == 'GET':
            return get_active_subscription(event)
        elif http_method == 'POST':
            return create_subscription(event)
        elif http_method == 'GET' and path_parameters.get('userId'):
            return get_user_subscriptions(path_parameters['userId'])
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def get_subscription_types():
    """Retourne les types d'abonnements disponibles (hardcodés pour MVP)."""
    types = [
        {
            'id': 'DAILY',
            'name': 'Pass Journalier',
            'duration': 1,
            'price': 100,  # HTG
            'description': 'Valable 24h, voyages illimités'
        },
        {
            'id': 'WEEKLY',
            'name': 'Pass Hebdomadaire',
            'duration': 7,
            'price': 600,
            'description': 'Valable 7 jours, voyages illimités'
        },
        {
            'id': 'MONTHLY',
            'name': 'Pass Mensuel',
            'duration': 30,
            'price': 2000,
            'description': 'Valable 30 jours, voyages illimités'
        }
    ]
    
    return success({'types': types})

def create_subscription(event):
    """Créer une demande d'abonnement."""
    body = json.loads(event.get('body', '{}'))
    
    # Récupérer userId depuis JWT (authorizer)
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_sub = claims.get('sub')
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    user_id = f"USER#{user_sub}"
    
    required = ['type', 'paymentId']
    for field in required:
        if field not in body:
            return error(400, f"Missing required field: {field}")
    
    # Calculer dates
    sub_type = body['type']
    durations = {'DAILY': 1, 'WEEKLY': 7, 'MONTHLY': 30}
    
    if sub_type not in durations:
        return error(400, "Invalid subscription type")
    
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=durations[sub_type])
    
    subscription_id = f"SUB#{str(uuid.uuid4())}"
    
    subscription_item = convert_floats({
        'userId': user_id,
        'subscriptionId': subscription_id,
        'type': sub_type,
        'status': 'PENDING',  # PENDING, ACTIVE, EXPIRED
        'startDate': start_date.isoformat(),
        'endDate': end_date.isoformat(),
        'paymentId': body['paymentId'],
        'maxRidesPerDay': None,  # Illimité
        'createdAt': start_date.isoformat()
    })
    
    put_item(TABLE_SUBSCRIPTIONS, subscription_item)
    
    return success({
        'subscription': subscription_item
    }, "Subscription request created. Awaiting payment approval.")

def get_active_subscription(event):
    """Récupérer l'abonnement actif de l'utilisateur connecté."""
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_sub = claims.get('sub')
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    user_id = f"USER#{user_sub}"
    
    # Query avec GSI user-status-index
    subscriptions = query_items(
        TABLE_SUBSCRIPTIONS,
        Key('userId').eq(user_id),
        Attr('status').eq('ACTIVE') & Attr('endDate').gte(datetime.utcnow().isoformat()),
        index_name='user-status-index'
    )
    
    if not subscriptions:
        return success({'subscription': None}, "No active subscription")
    
    # Retourner le plus récent
    active = sorted(subscriptions, key=lambda x: x['endDate'], reverse=True)[0]
    
    return success({'subscription': active})

def get_user_subscriptions(user_id):
    """Lister tous les abonnements d'un user (admin)."""
    subscriptions = query_items(
        TABLE_SUBSCRIPTIONS,
        Key('userId').eq(f"USER#{user_id}")
    )
    
    return success({'subscriptions': subscriptions, 'count': len(subscriptions)})

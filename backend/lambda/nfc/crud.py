import json
import os
import sys
import uuid
import hashlib
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import put_item, get_item, update_item, query_items, scan_items, convert_floats
from boto3.dynamodb.conditions import Key, Attr

TABLE_NFC = os.environ.get('TABLE_NFC', 'limajs-nfc-cards')

def lambda_handler(event, context):
    """
    Handler pour NFC Cards (Cartes physiques).
    Routes:
    - POST /nfc/issue -> Émettre une nouvelle carte (admin)
    - POST /nfc/activate -> Activer une carte
    - POST /nfc/block -> Bloquer une carte (admin)
    - POST /nfc/validate -> Valider une carte NFC (chauffeur)
    - GET /nfc/{userId} -> Cartes d'un utilisateur
    """
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    path_parameters = event.get('pathParameters') or {}
    
    try:
        if '/issue' in path and http_method == 'POST':
            return issue_card(event)
        elif '/activate' in path and http_method == 'POST':
            return activate_card(event)
        elif '/block' in path and http_method == 'POST':
            return block_card(event)
        elif '/validate' in path and http_method == 'POST':
            return validate_card(event)
        elif http_method == 'GET' and path_parameters.get('userId'):
            return get_user_cards(path_parameters['userId'])
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def hash_nfc_uid(uid):
    """Hash le UID NFC pour sécurité."""
    return hashlib.sha256(uid.encode()).hexdigest()

def issue_card(event):
    """Émettre une nouvelle carte NFC (Admin)."""
    body = json.loads(event.get('body', '{}'))
    
    user_id = body.get('userId')
    nfc_uid = body.get('nfcUid')  # UID unique de la carte physique
    
    if not user_id or not nfc_uid:
        return error(400, "userId and nfcUid required")
    
    card_id = f"NFC#{str(uuid.uuid4())}"
    nfc_uid_hash = hash_nfc_uid(nfc_uid)
    
    # Vérifier si UID existe déjà
    existing = query_items(
        TABLE_NFC,
        Key('nfcUidHash').eq(nfc_uid_hash),
        index_name='nfc-uid-index'
    )
    
    if existing:
        return error(409, "This NFC card is already registered")
    
    card_item = convert_floats({
        'userId': user_id,
        'cardId': card_id,
        'nfcUidHash': nfc_uid_hash,
        'status': 'PENDING_ACTIVATION',  # PENDING_ACTIVATION, ACTIVE, BLOCKED, EXPIRED
        'issuedAt': datetime.utcnow().isoformat(),
        'activatedAt': None,
        'expiryDate': None,  # Optionnel
        'lastUsed': None
    })
    
    put_item(TABLE_NFC, card_item)
    
    return success({
        'card': card_item
    }, "NFC card issued successfully")

def activate_card(event):
    """Activer une carte NFC (Utilisateur)."""
    body = json.loads(event.get('body', '{}'))
    
    card_id = body.get('cardId')
    activation_code = body.get('activationCode')  # Code fourni avec la carte physique
    
    if not card_id:
        return error(400, "cardId required")
    
    # Récupérer la carte (simplifié - pas de vérification du code pour MVP)
    cards = scan_items(TABLE_NFC, Attr('cardId').eq(card_id))
    
    if not cards:
        return error(404, "Card not found")
    
    card = cards[0]
    
    if card['status'] != 'PENDING_ACTIVATION':
        return error(400, f"Card is already {card['status']}")
    
    # Activer
    updated = update_item(
        TABLE_NFC,
        {'userId': card['userId'], 'cardId': card_id},
        "SET #status = :status, activatedAt = :activated",
        {
            ':status': 'ACTIVE',
            ':activated': datetime.utcnow().isoformat()
        },
        {'#status': 'status'}
    )
    
    return success({
        'card': updated
    }, "NFC card activated successfully")

def block_card(event):
    """Bloquer une carte NFC (Admin ou Utilisateur en cas de perte)."""
    body = json.loads(event.get('body', '{}'))
    
    card_id = body.get('cardId')
    reason = body.get('reason', 'User request')
    
    if not card_id:
        return error(400, "cardId required")
    
    cards = scan_items(TABLE_NFC, Attr('cardId').eq(card_id))
    
    if not cards:
        return error(404, "Card not found")
    
    card = cards[0]
    
    updated = update_item(
        TABLE_NFC,
        {'userId': card['userId'], 'cardId': card_id},
        "SET #status = :status, blockedAt = :blocked, blockReason = :reason",
        {
            ':status': 'BLOCKED',
            ':blocked': datetime.utcnow().isoformat(),
            ':reason': reason
        },
        {'#status': 'status'}
    )
    
    return success({
        'card': updated
    }, "NFC card blocked successfully")

def validate_card(event):
    """Valider une carte NFC lors d'un voyage (Chauffeur)."""
    body = json.loads(event.get('body', '{}'))
    
    nfc_uid = body.get('nfcUid')
    
    if not nfc_uid:
        return error(400, "nfcUid required")
    
    nfc_uid_hash = hash_nfc_uid(nfc_uid)
    
    # Query par GSI nfc-uid-index
    cards = query_items(
        TABLE_NFC,
        Key('nfcUidHash').eq(nfc_uid_hash),
        index_name='nfc-uid-index'
    )
    
    if not cards:
        return error(404, "NFC card not found")
    
    card = cards[0]
    
    # Vérifier statut
    if card['status'] != 'ACTIVE':
        return error(403, f"Card is {card['status']}. Access denied.")
    
    # Vérifier abonnement actif de l'utilisateur
    # (Logique similaire à celle des Tickets - vérifier TABLE_SUBSCRIPTIONS)
    # Pour MVP, on assume que si la carte est active, l'abonnement l'est aussi
    
    # Mettre à jour lastUsed
    updated = update_item(
        TABLE_NFC,
        {'userId': card['userId'], 'cardId': card['cardId']},
        "SET lastUsed = :now",
        {':now': datetime.utcnow().isoformat()}
    )
    
    return success({
        'card': updated,
        'userId': card['userId'],
        'access': 'GRANTED'
    }, "NFC card validated successfully")

def get_user_cards(user_id):
    """Liste des cartes NFC d'un utilisateur."""
    cards = query_items(
        TABLE_NFC,
        Key('userId').eq(f"USER#{user_id}")
    )
    
    return success({
        'cards': cards,
        'count': len(cards)
    })

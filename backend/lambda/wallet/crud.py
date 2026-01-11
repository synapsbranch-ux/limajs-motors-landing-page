"""
Système Wallet - Gestion du solde et des transactions
"""

import json
import os
from datetime import datetime
from decimal import Decimal
import uuid

import boto3

# Imports locaux
import sys
sys.path.insert(0, '/var/task')
from shared.db import get_table
from shared.response import success, error, get_user_sub


def get_balance(event, context):
    """GET /wallet/balance - Retourne le solde du wallet"""
    user_id = get_user_sub(event)
    
    if not user_id:
        return error(401, 'Unauthorized')
    
    table = get_table('limajs-users')
    response = table.get_item(Key={'userId': user_id, 'type': 'PROFILE'})
    user = response.get('Item', {})
    
    return success({
        'balance': float(user.get('walletBalance', 0)),
        'currency': user.get('walletCurrency', 'HTG'),
        'lastUpdate': user.get('lastWalletUpdate')
    })


def get_transactions(event, context):
    """GET /wallet/transactions - Historique des transactions"""
    user_id = get_user_sub(event)
    
    if not user_id:
        return error(401, 'Unauthorized')
    
    params = event.get('queryStringParameters') or {}
    limit = int(params.get('limit', 20))
    
    table = get_table('limajs-wallet-transactions')
    
    response = table.query(
        KeyConditionExpression='userId = :uid',
        ExpressionAttributeValues={':uid': user_id},
        ScanIndexForward=False,  # Most recent first
        Limit=limit
    )
    
    transactions = []
    for item in response.get('Items', []):
        transactions.append({
            'transactionId': item.get('transactionId'),
            'type': item.get('type'),  # credit or debit
            'amount': float(item.get('amount', 0)),
            'description': item.get('description'),
            'date': item.get('createdAt'),
            'relatedId': item.get('relatedId')
        })
    
    return success({'transactions': transactions})


def request_recharge(event, context):
    """POST /wallet/recharge - Demande de recharge (avec preuve de paiement)"""
    user_id = get_user_sub(event)
    
    if not user_id:
        return error(401, 'Unauthorized')
    
    try:
        body = json.loads(event.get('body', '{}'))
    except:
        return error(400, 'Invalid JSON body')
    
    amount = body.get('amount')
    if not amount or float(amount) <= 0:
        return error(400, 'Invalid amount')
    
    # Create a pending recharge request
    table = get_table('limajs-payments')
    payment_id = f"recharge-{uuid.uuid4().hex[:8]}"
    
    item = {
        'userId': user_id,
        'paymentId': payment_id,
        'type': 'wallet_recharge',
        'amount': Decimal(str(amount)),
        'currency': 'HTG',
        'status': 'pending',
        'submittedAt': datetime.now().isoformat(),
        'GSI1PK': datetime.now().strftime('%Y-%m-%d')
    }
    
    table.put_item(Item=item)
    
    # Generate presigned URL for proof upload
    s3 = boto3.client('s3')
    bucket = os.environ.get('PAYMENTS_BUCKET', 'limajs-payments')
    key = f"recharge-proofs/{user_id}/{payment_id}.jpg"
    
    upload_url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': bucket,
            'Key': key,
            'ContentType': 'image/jpeg'
        },
        ExpiresIn=3600
    )
    
    return success({
        'paymentId': payment_id,
        'uploadUrl': upload_url,
        'message': 'Veuillez uploader votre preuve de paiement'
    }, 201)


def pay_with_wallet(event, context):
    """POST /wallet/pay - Payer avec le solde du wallet"""
    user_id = get_user_sub(event)
    
    if not user_id:
        return error(401, 'Unauthorized')
    
    try:
        body = json.loads(event.get('body', '{}'))
    except:
        return error(400, 'Invalid JSON body')
    
    amount = body.get('amount')
    description = body.get('description', 'Paiement')
    related_id = body.get('relatedId')  # subscriptionId or tripId
    
    if not amount or float(amount) <= 0:
        return error(400, 'Invalid amount')
    
    amount = Decimal(str(amount))
    
    # Get current balance
    users_table = get_table('limajs-users')
    response = users_table.get_item(Key={'userId': user_id, 'type': 'PROFILE'})
    user = response.get('Item', {})
    
    current_balance = Decimal(str(user.get('walletBalance', 0)))
    
    if current_balance < amount:
        return error(400, 'Solde insuffisant', {
            'currentBalance': float(current_balance),
            'required': float(amount)
        })
    
    # Deduct from wallet (atomic operation)
    new_balance = current_balance - amount
    
    users_table.update_item(
        Key={'userId': user_id, 'type': 'PROFILE'},
        UpdateExpression='SET walletBalance = :balance, lastWalletUpdate = :now',
        ConditionExpression='walletBalance >= :amount',
        ExpressionAttributeValues={
            ':balance': new_balance,
            ':amount': amount,
            ':now': datetime.now().isoformat()
        }
    )
    
    # Record transaction
    tx_table = get_table('limajs-wallet-transactions')
    transaction_id = f"tx-{uuid.uuid4().hex[:12]}"
    
    tx_table.put_item(Item={
        'transactionId': transaction_id,
        'userId': user_id,
        'type': 'debit',
        'amount': amount,
        'description': description,
        'relatedId': related_id,
        'balanceAfter': new_balance,
        'createdAt': datetime.now().isoformat()
    })
    
    return success({
        'transactionId': transaction_id,
        'amount': float(amount),
        'newBalance': float(new_balance),
        'message': 'Paiement effectué avec succès'
    })


def credit_wallet(user_id: str, amount: Decimal, description: str, related_id: str = None):
    """Fonction utilitaire pour créditer un wallet (appelée après approbation d'une recharge)"""
    
    users_table = get_table('limajs-users')
    
    # Get current balance
    response = users_table.get_item(Key={'userId': user_id, 'type': 'PROFILE'})
    user = response.get('Item', {})
    current_balance = Decimal(str(user.get('walletBalance', 0)))
    
    new_balance = current_balance + amount
    
    # Update balance
    users_table.update_item(
        Key={'userId': user_id, 'type': 'PROFILE'},
        UpdateExpression='SET walletBalance = :balance, walletCurrency = :currency, lastWalletUpdate = :now',
        ExpressionAttributeValues={
            ':balance': new_balance,
            ':currency': 'HTG',
            ':now': datetime.now().isoformat()
        }
    )
    
    # Record transaction
    tx_table = get_table('limajs-wallet-transactions')
    transaction_id = f"tx-{uuid.uuid4().hex[:12]}"
    
    tx_table.put_item(Item={
        'transactionId': transaction_id,
        'userId': user_id,
        'type': 'credit',
        'amount': amount,
        'description': description,
        'relatedId': related_id,
        'balanceAfter': new_balance,
        'createdAt': datetime.now().isoformat()
    })
    
    return {
        'transactionId': transaction_id,
        'newBalance': float(new_balance)
    }


def handler(event, context):
    """Main handler routing to appropriate function"""
    method = event.get('httpMethod', event.get('requestContext', {}).get('http', {}).get('method'))
    path = event.get('path', event.get('rawPath', ''))
    
    if path.endswith('/balance') and method == 'GET':
        return get_balance(event, context)
    elif path.endswith('/transactions') and method == 'GET':
        return get_transactions(event, context)
    elif path.endswith('/recharge') and method == 'POST':
        return request_recharge(event, context)
    elif path.endswith('/pay') and method == 'POST':
        return pay_with_wallet(event, context)
    
    return error(404, 'Not found')

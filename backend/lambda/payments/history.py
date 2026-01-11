"""
Historique des paiements pour les passagers
"""

import json
from datetime import datetime

import sys
sys.path.insert(0, '/var/task')
from shared.db import get_table
from shared.response import success, error


def get_payment_history(event, context):
    """GET /payments/history - Historique des paiements du passager"""
    user_id = event.get('requestContext', {}).get('authorizer', {}).get('claims', {}).get('sub')
    
    if not user_id:
        return error(401, 'Unauthorized')
    
    params = event.get('queryStringParameters') or {}
    limit = int(params.get('limit', 20))
    payment_type = params.get('type')  # 'subscription', 'wallet_recharge', or all
    
    table = get_table('limajs-payments')
    
    query_params = {
        'KeyConditionExpression': 'userId = :uid',
        'ExpressionAttributeValues': {':uid': user_id},
        'ScanIndexForward': False,
        'Limit': limit
    }
    
    if payment_type:
        query_params['FilterExpression'] = '#type = :type'
        query_params['ExpressionAttributeNames'] = {'#type': 'type'}
        query_params['ExpressionAttributeValues'][':type'] = payment_type
    
    response = table.query(**query_params)
    
    payments = []
    for item in response.get('Items', []):
        payment = {
            'paymentId': item.get('paymentId'),
            'date': item.get('submittedAt', item.get('createdAt', '')),
            'amount': float(item.get('amount', 0)),
            'currency': item.get('currency', 'HTG'),
            'type': item.get('type', 'subscription'),
            'status': item.get('status', 'pending'),
            'description': get_payment_description(item)
        }
        
        # Add invoice URL if available
        if item.get('invoiceUrl'):
            payment['invoiceUrl'] = item['invoiceUrl']
        
        payments.append(payment)
    
    return success({
        'payments': payments,
        'count': len(payments)
    })


def get_payment_description(payment: dict) -> str:
    """Génère une description lisible pour le paiement"""
    payment_type = payment.get('type', 'payment')
    
    if payment_type == 'subscription':
        sub_type = payment.get('subscriptionType', 'monthly')
        type_names = {
            'daily': 'Pass Journalier',
            'weekly': 'Pass Hebdomadaire',
            'monthly': 'Pass Mensuel'
        }
        return type_names.get(sub_type, 'Abonnement')
    
    elif payment_type == 'wallet_recharge':
        return 'Recharge Wallet'
    
    elif payment_type == 'trip':
        return 'Paiement trajet'
    
    return payment.get('description', 'Paiement')


def handler(event, context):
    """Main handler"""
    return get_payment_history(event, context)

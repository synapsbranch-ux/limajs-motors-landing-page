import json
import os
import sys
import uuid
import boto3
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import put_item, get_item, query_items, scan_items, update_item, convert_floats
from boto3.dynamodb.conditions import Key, Attr

TABLE_PAYMENTS = os.environ.get('TABLE_PAYMENTS', 'limajs-payments')
S3_BUCKET = os.environ.get('AWS_S3_BUCKET_NAME')

s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Handler pour Payments.
    Routes:
    - POST /payments/upload -> Upload preuve de paiement
    - POST /payments/presigned-url -> Générer URL pré-signée pour upload S3
    - GET /payments/pending -> Liste paiements en attente (admin)
    - POST /payments/{paymentId}/approve -> Approuver paiement (admin)
    - POST /payments/{paymentId}/reject -> Rejeter paiement (admin)
    """
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    path_parameters = event.get('pathParameters') or {}
    
    try:
        if '/presigned-url' in path and http_method == 'POST':
            return generate_presigned_url(event)
        elif '/upload' in path and http_method == 'POST':
            return create_payment(event)
        elif '/pending' in path and http_method == 'GET':
            return list_pending_payments()
        elif '/approve' in path and http_method == 'POST':
            return approve_payment(path_parameters['paymentId'], event)
        elif '/reject' in path and http_method == 'POST':
            return reject_payment(path_parameters['paymentId'], event)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def generate_presigned_url(event):
    """Générer une URL pré-signée pour upload direct S3 depuis le frontend."""
    body = json.loads(event.get('body', '{}'))
    
    file_name = body.get('fileName')
    file_type = body.get('fileType', 'image/jpeg')
    
    if not file_name:
        return error(400, "fileName is required")
    
    # Récupérer userId
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_sub = claims.get('sub')
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    # Générer clé S3 unique
    s3_key = f"payments/{user_sub}/{uuid.uuid4()}-{file_name}"
    
    try:
        # Générer URL pré-signée (valide 15 minutes)
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': s3_key,
                'ContentType': file_type
            },
            ExpiresIn=900  # 15 minutes
        )
        
        return success({
            'uploadUrl': presigned_url,
            's3Key': s3_key
        }, "Presigned URL generated")
        
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return error(500, str(e))

def create_payment(event):
    """Enregistrer un paiement après upload S3."""
    body = json.loads(event.get('body', '{}'))
    
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_sub = claims.get('sub')
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    user_id = f"USER#{user_sub}"
    
    required = ['amount', 'subscriptionType', 'proofS3Key']
    for field in required:
        if field not in body:
            return error(400, f"Missing required field: {field}")
    
    payment_id = f"PAYMENT#{str(uuid.uuid4())}"
    
    payment_item = convert_floats({
        'paymentId': payment_id,
        'timestamp': datetime.utcnow().isoformat(),
        'userId': user_id,
        'amount': body['amount'],
        'currency': body.get('currency', 'HTG'),
        'method': body.get('method', 'BANK_TRANSFER'),
        'subscriptionType': body['subscriptionType'],
        'status': 'PENDING',  # PENDING, APPROVED, REJECTED
        'proofS3Key': body['proofS3Key'],
        'notes': body.get('notes', ''),
        'createdAt': datetime.utcnow().isoformat()
    })
    
    put_item(TABLE_PAYMENTS, payment_item)
    
    return success({
        'payment': payment_item
    }, "Payment proof uploaded successfully. Awaiting admin approval.")

def list_pending_payments():
    """Lister tous les paiements en attente (Admin)."""
    payments = query_items(
        TABLE_PAYMENTS,
        Key('status').eq('PENDING'),
        index_name='status-timestamp-index'
    )
    
    return success({'payments': payments, 'count': len(payments)})

def approve_payment(payment_id, event):
    """Approuver un paiement (Admin)."""
    payment = get_item(TABLE_PAYMENTS, {
        'paymentId': payment_id,
        'timestamp': event.get('body') and json.loads(event['body']).get('timestamp')
    })
    
    if not payment:
        # Fallback: scan pour trouver le payment
        all_payments = scan_items(TABLE_PAYMENTS, Attr('paymentId').eq(payment_id))
        if not all_payments:
            return error(404, "Payment not found")
        payment = all_payments[0]
    
    # Mettre à jour le statut
    updated = update_item(
        TABLE_PAYMENTS,
        {'paymentId': payment_id, 'timestamp': payment['timestamp']},
        "SET #status = :status, approvedAt = :approved",
        {':status': 'APPROVED', ':approved': datetime.utcnow().isoformat()},
        {'#status': 'status'}
    )
    
    # Activer l'abonnement correspondant
    TABLE_SUBSCRIPTIONS = os.environ.get('TABLE_SUBSCRIPTIONS', 'limajs-subscriptions')
    
    # Trouver l'abonnement PENDING lié à ce paiement
    subs = scan_items(TABLE_SUBSCRIPTIONS, Attr('paymentId').eq(payment_id))
    
    if subs:
        sub = subs[0]
        update_item(
            TABLE_SUBSCRIPTIONS,
            {'userId': sub['userId'], 'subscriptionId': sub['subscriptionId']},
            "SET #status = :status, activatedAt = :activated",
            {':status': 'ACTIVE', ':activated': datetime.utcnow().isoformat()},
            {'#status': 'status'}
        )
        print(f"✅ Abonnement {sub['subscriptionId']} activé")
    
    return success({'payment': updated}, "Payment approved and subscription activated")

def reject_payment(payment_id, event):
    """Rejeter un paiement (Admin)."""
    body = json.loads(event.get('body', '{}'))
    
    all_payments = scan_items(TABLE_PAYMENTS, Attr('paymentId').eq(payment_id))
    if not all_payments:
        return error(404, "Payment not found")
    
    payment = all_payments[0]
    
    updated = update_item(
        TABLE_PAYMENTS,
        {'paymentId': payment_id, 'timestamp': payment['timestamp']},
        "SET #status = :status, rejectedAt = :rejected, rejectionReason = :reason",
        {
            ':status': 'REJECTED',
            ':rejected': datetime.utcnow().isoformat(),
            ':reason': body.get('reason', 'No reason provided')
        },
        {'#status': 'status'}
    )
    
    return success({'payment': updated}, "Payment rejected")

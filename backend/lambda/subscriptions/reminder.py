"""
Lambda pour les rappels d'abonnement automatiques
Déclenché quotidiennement par EventBridge
"""

import os
import json
from datetime import datetime, timedelta
from decimal import Decimal

import boto3

# Imports locaux
import sys
sys.path.insert(0, '/var/task')
from shared.db import get_table
from shared.resend_client import send_email
from invoices.generate import generate_and_upload_invoice

# Configuration
REGION = 'us-east-1'
dynamodb = boto3.resource('dynamodb', region_name=REGION)


def get_expiring_subscriptions(days_until_expiry: int) -> list:
    """
    Récupère les abonnements qui expirent dans X jours
    """
    table = get_table('limajs-subscriptions')
    
    target_date = (datetime.now() + timedelta(days=days_until_expiry)).strftime('%Y-%m-%d')
    
    # Query by status and endDate
    response = table.query(
        IndexName='status-enddate',
        KeyConditionExpression='#status = :status AND #endDate = :date',
        ExpressionAttributeNames={
            '#status': 'status',
            '#endDate': 'endDate'
        },
        ExpressionAttributeValues={
            ':status': 'active',
            ':date': target_date
        }
    )
    
    return response.get('Items', [])


def get_user(user_id: str) -> dict:
    """Récupère les infos utilisateur"""
    table = get_table('limajs-users')
    response = table.get_item(Key={'userId': user_id, 'type': 'PROFILE'})
    return response.get('Item', {})


def get_subscription_type(type_id: str) -> dict:
    """Récupère les infos du type d'abonnement"""
    table = get_table('limajs-subscriptions')
    response = table.get_item(Key={'pk': 'TYPE', 'sk': type_id})
    return response.get('Item', {})


def create_invoice_record(user: dict, subscription: dict, sub_type: dict) -> dict:
    """Crée un enregistrement de facture dans DynamoDB"""
    table = get_table('limajs-invoices')
    
    invoice_id = f"inv-{datetime.now().strftime('%Y%m%d%H%M%S')}-{user['userId'][-6:]}"
    
    item = {
        'invoiceId': invoice_id,
        'userId': user['userId'],
        'subscriptionId': subscription.get('subscriptionId') or subscription.get('sk'),
        'amount': sub_type.get('price', 0),
        'currency': sub_type.get('currency', 'HTG'),
        'status': 'pending',
        'dueDate': subscription.get('endDate'),
        'createdAt': datetime.now().isoformat()
    }
    
    table.put_item(Item=item)
    return item


def send_reminder_email(user: dict, subscription: dict, sub_type: dict, days_remaining: int, invoice_pdf: bytes):
    """Envoie l'email de rappel avec la facture en pièce jointe"""
    
    if days_remaining == 7:
        subject = "🔔 Rappel: Votre abonnement expire dans 7 jours"
        urgency = "dans 7 jours"
    elif days_remaining == 3:
        subject = "⚠️ Urgent: Votre abonnement expire dans 3 jours"
        urgency = "dans 3 jours"
    else:
        subject = "❌ Votre abonnement expire aujourd'hui"
        urgency = "aujourd'hui"
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }}
            h1 {{ color: #2563EB; }}
            .warning {{ background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }}
            .urgent {{ background: #FEE2E2; border-left: 4px solid #EF4444; }}
            .btn {{ display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
            .footer {{ color: #9CA3AF; font-size: 12px; margin-top: 30px; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>LimaJS Motors</h1>
            <p>Bonjour {user.get('firstName', 'Client')},</p>
            
            <div class="warning {'urgent' if days_remaining <= 3 else ''}">
                <strong>Votre abonnement {sub_type.get('name', 'Pass')} expire {urgency}.</strong>
            </div>
            
            <p>Pour continuer à profiter de nos services de transport, veuillez renouveler votre abonnement.</p>
            
            <h3>Détails:</h3>
            <ul>
                <li><strong>Type:</strong> {sub_type.get('name', 'Abonnement')}</li>
                <li><strong>Prix:</strong> {sub_type.get('price', 0)} {sub_type.get('currency', 'HTG')}</li>
                <li><strong>Expiration:</strong> {subscription.get('endDate')}</li>
            </ul>
            
            <p>Vous trouverez la facture en pièce jointe.</p>
            
            <p><strong>Période de grâce:</strong> Vous disposez d'une semaine après l'expiration pour renouveler sans interruption de service.</p>
            
            <a href="https://app.limajsmotors.com/subscription" class="btn">Renouveler maintenant</a>
            
            <div class="footer">
                <p>Merci de votre confiance!</p>
                <p>LimaJS Motors - Transport Collectif</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    import base64
    
    send_email(
        to=user.get('email'),
        subject=subject,
        html=html_content,
        attachments=[{
            'filename': f'facture-limajs-{datetime.now().strftime("%Y%m%d")}.pdf',
            'content': base64.b64encode(invoice_pdf).decode('utf-8'),
            'type': 'application/pdf'
        }]
    )


def process_reminders(days: int):
    """Traite les rappels pour un nombre de jours donné"""
    subscriptions = get_expiring_subscriptions(days)
    
    print(f"📧 Found {len(subscriptions)} subscriptions expiring in {days} days")
    
    for sub in subscriptions:
        try:
            # Get user and subscription type
            user = get_user(sub.get('userId') or sub.get('pk', '').replace('USER#', ''))
            if not user:
                continue
            
            sub_type = get_subscription_type(sub.get('subscriptionType', 'monthly'))
            
            # Create invoice record
            invoice_record = create_invoice_record(user, sub, sub_type)
            
            # Generate PDF invoice
            invoice_data = {
                'invoiceNumber': invoice_record['invoiceId'].upper(),
                'date': datetime.now().strftime('%d/%m/%Y'),
                'dueDate': sub.get('endDate', ''),
                'status': 'unpaid',
                'customer': {
                    'name': f"{user.get('firstName', '')} {user.get('lastName', '')}".strip(),
                    'email': user.get('email', ''),
                    'phone': user.get('phone', '')
                },
                'items': [{
                    'description': f"{sub_type.get('name', 'Abonnement')} - Renouvellement",
                    'quantity': 1,
                    'unitPrice': float(sub_type.get('price', 0)),
                    'total': float(sub_type.get('price', 0))
                }],
                'subtotal': float(sub_type.get('price', 0)),
                'total': float(sub_type.get('price', 0)),
                'currency': sub_type.get('currency', 'HTG'),
                'period': {
                    'start': sub.get('endDate', ''),
                    'end': (datetime.strptime(sub.get('endDate', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d') + 
                           timedelta(days=sub_type.get('duration', 30))).strftime('%d/%m/%Y')
                }
            }
            
            result = generate_and_upload_invoice(invoice_data)
            
            # Update invoice record with PDF URL
            table = get_table('limajs-invoices')
            table.update_item(
                Key={'invoiceId': invoice_record['invoiceId'], 'userId': user['userId']},
                UpdateExpression='SET pdfUrl = :url',
                ExpressionAttributeValues={':url': result['pdfUrl']}
            )
            
            # Send reminder email
            send_reminder_email(user, sub, sub_type, days, result['pdfBytes'])
            
            print(f"  ✅ Sent reminder to {user.get('email')}")
            
        except Exception as e:
            print(f"  ❌ Error processing subscription: {e}")


def handler(event, context):
    """Lambda handler - triggered daily by EventBridge"""
    print("🔔 Starting subscription reminder job...")
    print(f"📅 Current date: {datetime.now().isoformat()}")
    
    # Process reminders for different timeframes
    process_reminders(7)   # 7 days before
    process_reminders(3)   # 3 days before
    process_reminders(0)   # Day of expiration
    
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Reminders processed successfully'})
    }

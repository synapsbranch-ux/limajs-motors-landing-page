"""
Client Resend pour l'envoi d'emails
Supporte les pièces jointes (factures PDF)
"""

import os
import json
import requests

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@limajs.com')


def send_email(to: str, subject: str, html: str, attachments: list = None, text: str = None) -> dict:
    """
    Envoie un email via Resend API
    
    Args:
        to: Email destinataire
        subject: Sujet
        html: Contenu HTML
        attachments: Liste de pièces jointes [{filename, content (base64), type}]
        text: Contenu texte (optionnel)
    
    Returns:
        Response dict from Resend API
    """
    if not RESEND_API_KEY:
        print("⚠️ RESEND_API_KEY not configured, email not sent")
        return {'error': 'API key not configured'}
    
    payload = {
        'from': FROM_EMAIL,
        'to': [to] if isinstance(to, str) else to,
        'subject': subject,
        'html': html
    }
    
    if text:
        payload['text'] = text
    
    if attachments:
        payload['attachments'] = attachments
    
    try:
        response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {RESEND_API_KEY}',
                'Content-Type': 'application/json'
            },
            json=payload,
            timeout=10
        )
        
        result = response.json()
        
        if response.status_code in [200, 201]:
            print(f"✅ Email sent to {to}: {subject}")
            return {'success': True, 'id': result.get('id')}
        else:
            print(f"❌ Failed to send email: {result}")
            return {'error': result.get('message', 'Unknown error')}
            
    except Exception as e:
        print(f"❌ Email error: {e}")
        return {'error': str(e)}


def send_payment_received_email(user: dict, payment: dict):
    """Email de confirmation de réception de preuve de paiement"""
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }}
            h1 {{ color: #2563EB; }}
            .success {{ background: #D1FAE5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }}
            .footer {{ color: #9CA3AF; font-size: 12px; margin-top: 30px; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>LimaJS Motors</h1>
            <p>Bonjour {user.get('firstName', 'Client')},</p>
            
            <div class="success">
                <strong>✅ Nous avons bien reçu votre preuve de paiement !</strong>
            </div>
            
            <p>Votre demande est en cours de traitement. Nous vous confirmerons dans les plus brefs délais.</p>
            
            <h3>Détails:</h3>
            <ul>
                <li><strong>Référence:</strong> {payment.get('paymentId')}</li>
                <li><strong>Montant:</strong> {payment.get('amount')} {payment.get('currency', 'HTG')}</li>
                <li><strong>Date:</strong> {payment.get('submittedAt', '')[:10]}</li>
            </ul>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            
            <div class="footer">
                <p>Merci pour votre confiance!</p>
                <p>LimaJS Motors - Transport Collectif</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(
        to=user.get('email'),
        subject="✅ Preuve de paiement reçue - LimaJS Motors",
        html=html
    )


def send_payment_approved_email(user: dict, payment: dict, invoice_pdf: bytes = None):
    """Email de confirmation d'approbation du paiement"""
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }}
            h1 {{ color: #2563EB; }}
            .approved {{ background: #D1FAE5; border: 2px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }}
            .approved h2 {{ color: #10B981; margin: 0; }}
            .footer {{ color: #9CA3AF; font-size: 12px; margin-top: 30px; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>LimaJS Motors</h1>
            <p>Bonjour {user.get('firstName', 'Client')},</p>
            
            <div class="approved">
                <h2>🎉 Paiement Approuvé!</h2>
            </div>
            
            <p>Votre paiement a été vérifié et approuvé. Votre abonnement est maintenant actif!</p>
            
            <h3>Détails:</h3>
            <ul>
                <li><strong>Référence:</strong> {payment.get('paymentId')}</li>
                <li><strong>Montant:</strong> {payment.get('amount')} {payment.get('currency', 'HTG')}</li>
                <li><strong>Type:</strong> {payment.get('subscriptionType', 'Abonnement')}</li>
            </ul>
            
            <p>Vous trouverez votre facture en pièce jointe.</p>
            
            <div class="footer">
                <p>Merci pour votre confiance!</p>
                <p>LimaJS Motors - Transport Collectif</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    attachments = None
    if invoice_pdf:
        import base64
        attachments = [{
            'filename': f"facture-{payment.get('paymentId', 'limajs')}.pdf",
            'content': base64.b64encode(invoice_pdf).decode('utf-8'),
            'type': 'application/pdf'
        }]
    
    return send_email(
        to=user.get('email'),
        subject="🎉 Paiement approuvé - LimaJS Motors",
        html=html,
        attachments=attachments
    )


def send_payment_rejected_email(user: dict, payment: dict, reason: str = None):
    """Email de notification de rejet du paiement"""
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }}
            h1 {{ color: #2563EB; }}
            .rejected {{ background: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }}
            .btn {{ display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
            .footer {{ color: #9CA3AF; font-size: 12px; margin-top: 30px; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>LimaJS Motors</h1>
            <p>Bonjour {user.get('firstName', 'Client')},</p>
            
            <div class="rejected">
                <strong>❌ Votre paiement n'a pas pu être validé</strong>
            </div>
            
            <p><strong>Raison:</strong> {reason or 'Preuve de paiement invalide ou illisible'}</p>
            
            <h3>Détails:</h3>
            <ul>
                <li><strong>Référence:</strong> {payment.get('paymentId')}</li>
                <li><strong>Montant:</strong> {payment.get('amount')} {payment.get('currency', 'HTG')}</li>
            </ul>
            
            <p>Veuillez soumettre une nouvelle preuve de paiement.</p>
            
            <a href="https://app.limajsmotors.com/subscription" class="btn">Réessayer</a>
            
            <div class="footer">
                <p>LimaJS Motors - Transport Collectif</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(
        to=user.get('email'),
        subject="❌ Paiement non validé - LimaJS Motors",
        html=html
    )

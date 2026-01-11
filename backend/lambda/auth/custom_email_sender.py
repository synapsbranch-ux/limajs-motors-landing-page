import json
import base64
import os
import boto3
import sys
from botocore.exceptions import ClientError

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.resend_client import send_email

# Note: Pour un vrai Custom Email Sender, le code est chiffré avec KMS.
# Cette fonction est un template d'implémentation.
# Il faudrait ajouter la logique de déchiffrement KMS ici.
# KEY_ID = os.environ['KMS_KEY_ID']
# kms = boto3.client('kms')

def lambda_handler(event, context):
    """
    Trigger Cognito Custom Email Sender.
    Reçoit un event avec le code chiffré et l'envoie via Resend.
    """
    print(f"Received Custom Email Sender Event: {json.dumps(event)}")
    
    try:
        # 1. Extraire infos
        user_attributes = event['request']['userAttributes']
        email = user_attributes['email']
        code = event['request']['code'] # Note: En réalité, c'est chiffré si CustomSender est actif
        
        # Logic de déchiffrement KMS simplifiée (placeholder)
        # decrypted_code = kms.decrypt(CiphertextBlob=base64.b64decode(code))['Plaintext'].decode('utf-8')
        decrypted_code = code # Pour test/MVP si pas KMS stricte
        
        email_type = event['triggerSource'] # 'CustomEmailSender_SignUp' ou 'CustomEmailSender_ForgotPassword'
        
        subject = "Votre Code de Validation LimaJS"
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Bienvenue chez LimaJS !</h1>
            <p>Voici votre code de vérification :</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                {decrypted_code}
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">Ce code expirera dans quelques minutes.</p>
        </div>
        """
        
        if email_type == 'CustomEmailSender_ForgotPassword':
            subject = "Réinitialisation de mot de passe LimaJS"
        
        # 2. Envoyer via Resend
        success = send_email(email, subject, html_content)
        
        if not success:
            raise Exception("Failed to send email via Resend")
            
    except Exception as e:
        print(f"Error handling custom email sender: {e}")
        # En production, on voudrait peut-être retry ou logger en dead letter queue
        raise e
        
    return event

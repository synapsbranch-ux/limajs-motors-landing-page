import requests
import os
import json
from .secrets import get_secret

# Nom du secret stocké dans AWS Secrets Manager
SECRET_NAME = os.environ.get('SECRET_NAME', 'limajs/backend/production') 

def send_email(to_email, subject, html_content):
    """
    Envoie un email via l'API Resend en utilisant la clé API stockée dans Secrets Manager.
    """
    try:
        # 1. Récupérer la clé API (sécurisé)
        secrets = get_secret(SECRET_NAME)
        # Gestion cas string vs dict
        api_key = secrets.get('RESEND_API_KEY') if isinstance(secrets, dict) else secrets
        
        if not api_key:
            print("❌ Clé API Resend introuvable dans les secrets.")
            return False

        # 2. Préparer la requête Resend
        url = "https://api.resend.com/emails"
        
        payload = {
            "from": "LimaJS <noreply@limajs.com>", # À configurer dans Resend Dashboard
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # 3. Envoyer
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ Email envoyé à {to_email}")
            return True
        else:
            print(f"❌ Erreur Resend ({response.status_code}): {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception Send Email: {e}")
        return False

import boto3
import json
import os
from botocore.exceptions import ClientError

# Cache simple en mémoire (durée de vie du conteneur Lambda)
_SECRETS_CACHE = {}

def get_secret(secret_name):
    """
    Récupère un secret depuis AWS Secrets Manager.
    Utilise un cache local pour optimiser les performances et coûts.
    """
    global _SECRETS_CACHE
    
    # 1. Vérifier le cache
    if secret_name in _SECRETS_CACHE:
        return _SECRETS_CACHE[secret_name]

    region_name = os.environ.get('AWS_REGION', 'us-east-1')

    # 2. Créer client Secrets Manager
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        # 3. Appel API AWS
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        print(f"❌ Erreur lors de la récupération du secret {secret_name}: {e}")
        raise e
    else:
        # 4. Décoder et mettre en cache
        if 'SecretString' in get_secret_value_response:
            secret = get_secret_value_response['SecretString']
            try:
                # Tenter de parser le JSON si c'est un dictionnaire de secrets
                secret_dict = json.loads(secret)
                _SECRETS_CACHE[secret_name] = secret_dict
                return secret_dict
            except json.JSONDecodeError:
                # Sinon retourner la chaîne brute
                _SECRETS_CACHE[secret_name] = secret
                return secret
                
    return None

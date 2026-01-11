import json
import boto3
import os
import sys

# Ajouter le chemin vers shared pour imports locaux (pour déploiement, shared sera packagé)
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error

client = boto3.client('cognito-idp')
USER_POOL_CLIENT_ID = os.environ.get('VITE_COGNITO_CLIENT_ID')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        password = body.get('password')
        name = body.get('name')
        
        if not email or not password or not name:
            return error(400, "Email, password, and name are required")

        # Inscription Cognito
        response = client.sign_up(
            ClientId=USER_POOL_CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': name}
            ]
        )
        
        user_sub = response['UserSub']
        
        # Création du profil dans DynamoDB
        dynamodb = boto3.client('dynamodb')
        TABLE_USERS = os.environ.get('TABLE_USERS', 'limajs-users')
        
        dynamodb.put_item(
            TableName=TABLE_USERS,
            Item={
                'userId': {'S': f"USER#{user_sub}"},
                'type': {'S': 'PROFILE'},
                'email': {'S': email},
                'name': {'S': name},
                'role': {'S': 'PASSENGER'}, # Rôle par défaut
                'isActive': {'BOOL': True},
                'createdAt': {'S': str(os.environ.get('AWS_LAMBDA_REQUEST_ID'))} # Timestamp idéalement
            }
        )
        
        return success(
            {
                "userSub": user_sub,
                "userConfirmed": response['UserConfirmed']
            },
            "User registered successfully. Please check your email for verification code."
        )

    except client.exceptions.UsernameExistsException:
        return error(409, "User already exists")
    except client.exceptions.InvalidPasswordException:
        return error(400, "Password does not meet policy requirements")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

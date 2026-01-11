import json
import boto3
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error

client = boto3.client('cognito-idp')
USER_POOL_CLIENT_ID = os.environ.get('VITE_COGNITO_CLIENT_ID')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return error(400, "Email and password are required")

        # Authentification Cognito
        response = client.initiate_auth(
            ClientId=USER_POOL_CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        
        auth_result = response['AuthenticationResult']
        
        return success({
            "accessToken": auth_result['AccessToken'],
            "idToken": auth_result['IdToken'],
            "refreshToken": auth_result['RefreshToken'],
            "expiresIn": auth_result['ExpiresIn'],
            "tokenType": auth_result['TokenType']
        }, "Login successful")

    except client.exceptions.NotAuthorizedException:
        return error(401, "Incorrect username or password")
    except client.exceptions.UserNotConfirmedException:
        return error(403, "User is not confirmed")
    except client.exceptions.UserNotFoundException:
        return error(404, "User does not exist")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

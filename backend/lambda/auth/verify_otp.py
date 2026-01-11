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
        code = body.get('code')
        
        if not email or not code:
            return error(400, "Email and verification code are required")

        # Confirmation Cognito
        client.confirm_sign_up(
            ClientId=USER_POOL_CLIENT_ID,
            Username=email,
            ConfirmationCode=code
        )
        
        return success(None, "Account verified successfully. You can now login.")

    except client.exceptions.CodeMismatchException:
        return error(400, "Invalid verification code")
    except client.exceptions.ExpiredCodeException:
        return error(400, "Verification code has expired")
    except client.exceptions.UserNotFoundException:
        return error(404, "User not found")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

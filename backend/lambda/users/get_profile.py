import json
import boto3
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error, get_user_claims, get_user_sub

dynamodb = boto3.client('dynamodb')
TABLE_USERS = os.environ.get('TABLE_USERS', 'limajs-users')

def lambda_handler(event, context):
    try:
        # Get user sub from JWT claims (supports both REST API and HTTP API)
        user_sub = get_user_sub(event)
        
        if not user_sub:
            return error(401, "Unauthorized: No user identity found")

        user_id = f"USER#{user_sub}"

        response = dynamodb.get_item(
            TableName=TABLE_USERS,
            Key={
                'userId': {'S': user_id},
                'type': {'S': 'PROFILE'}
            }
        )
        
        item = response.get('Item')
        if not item:
            return error(404, "Profile not found")

        # Conversion DynamoDB JSON -> Python Dict simple
        profile = {
            'id': item['userId']['S'].replace('USER#', ''),
            'email': item['email']['S'],
            'name': item['name']['S'],
            'role': item.get('role', {}).get('S', 'PASSENGER'),
            'isActive': item.get('isActive', {}).get('BOOL', False)
        }
        
        return success(profile, "Profile retrieved successfully")

    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

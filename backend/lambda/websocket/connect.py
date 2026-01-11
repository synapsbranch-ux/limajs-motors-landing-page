import json
import os
import sys
import boto3
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import put_item, convert_floats

TABLE_CONNECTIONS = os.environ.get('TABLE_CONNECTIONS', 'limajs-websocket-connections')

def lambda_handler(event, context):
    """
    Gère les nouvelles connexions WebSocket.
    Enregistre la connexion dans DynamoDB.
    """
    connection_id = event['requestContext']['connectionId']
    
    try:
        # Enregistrer la connexion
        connection_item = convert_floats({
            'connectionId': connection_id,
            'connectedAt': datetime.utcnow().isoformat(),
            'routeId': None,  # Sera défini lors du subscribe
            'ttl': int((datetime.utcnow().timestamp()) + 3600)  # Expire après 1h
        })
        
        put_item(TABLE_CONNECTIONS, connection_item)
        
        print(f"✅ Connexion enregistrée: {connection_id}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Connected'})
        }
        
    except Exception as e:
        print(f"❌ Erreur connect: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to connect'})
        }

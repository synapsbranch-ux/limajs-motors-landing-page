import json
import os
import sys
import boto3

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.db import delete_item

TABLE_CONNECTIONS = os.environ.get('TABLE_CONNECTIONS', 'limajs-websocket-connections')

def lambda_handler(event, context):
    """
    Gère les déconnexions WebSocket.
    Supprime la connexion de DynamoDB.
    """
    connection_id = event['requestContext']['connectionId']
    
    try:
        # Supprimer la connexion
        delete_item(TABLE_CONNECTIONS, {'connectionId': connection_id})
        
        print(f"✅ Connexion supprimée: {connection_id}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Disconnected'})
        }
        
    except Exception as e:
        print(f"❌ Erreur disconnect: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to disconnect'})
        }

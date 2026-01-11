import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.db import update_item, convert_floats

TABLE_CONNECTIONS = os.environ.get('TABLE_CONNECTIONS', 'limajs-websocket-connections')

def lambda_handler(event, context):
    """
    Gère les messages WebSocket entrants.
    Action: 'subscribe' -> S'abonner aux updates d'une ligne
    """
    connection_id = event['requestContext']['connectionId']
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'subscribe':
            route_id = body.get('routeId')
            
            if not route_id:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'routeId required'})
                }
            
            # Mettre à jour la connexion avec la routeId
            update_item(
                TABLE_CONNECTIONS,
                {'connectionId': connection_id},
                "SET routeId = :routeId",
                convert_floats({':routeId': route_id})
            )
            
            print(f"✅ Connexion {connection_id} abonnée à route {route_id}")
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': f'Subscribed to route {route_id}'
                })
            }
        
        elif action == 'unsubscribe':
            # Retirer l'abonnement
            update_item(
                TABLE_CONNECTIONS,
                {'connectionId': connection_id},
                "SET routeId = :null",
                {':null': None}
            )
            
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Unsubscribed'})
            }
        
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': f'Unknown action: {action}'})
            }
            
    except Exception as e:
        print(f"❌ Erreur subscribe: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': str(e)})
        }

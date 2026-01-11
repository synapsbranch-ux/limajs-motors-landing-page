import boto3
import os
import json
import time
from botocore.exceptions import ClientError, EndpointConnectionError

# Configuration
AWS_REGION = "us-east-1"
ENV_FILE_PATH = "../../.env"
ENV_EXAMPLE_PATH = "../../.env.example"

# Clients
apigatewayv2 = boto3.client('apigatewayv2', region_name=AWS_REGION)
dynamodb = boto3.client('dynamodb', region_name=AWS_REGION)
sts = boto3.client('sts', region_name=AWS_REGION)

def update_env_file(key, value):
    """Mise à jour des fichiers .env et .env.example."""
    content = ""
    if os.path.exists(ENV_FILE_PATH):
        with open(ENV_FILE_PATH, "r") as f:
            content = f.read()

    if f"{key}=" in content:
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if line.startswith(f"{key}="):
                new_lines.append(f"{key}={value}")
            else:
                new_lines.append(line)
        content = "\n".join(new_lines)
    else:
        content += f"\n{key}={value}"

    with open(ENV_FILE_PATH, "w") as f:
        f.write(content)
    
    print(f"   📝 Config {key} mise à jour.")

def table_exists(table_name):
    """Vérifie si une table existe déjà."""
    try:
        dynamodb.describe_table(TableName=table_name)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            return False
        raise

def create_connections_table():
    """Crée la table DynamoDB pour les connexions WebSocket."""
    print("\n📊 Configuration Table WebSocket Connections...")
    
    table_name = "limajs-websocket-connections"
    
    if table_exists(table_name):
        print(f"   ℹ️ La table {table_name} existe déjà.")
        update_env_file("TABLE_CONNECTIONS", table_name)
        return table_name
    
    print(f"   📦 Création de la table : {table_name}...")
    
    try:
        dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'connectionId', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'connectionId', 'AttributeType': 'S'},
                {'AttributeName': 'routeId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'route-connections-index',
                    'KeySchema': [
                        {'AttributeName': 'routeId', 'KeyType': 'HASH'},
                        {'AttributeName': 'connectionId', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        
        print(f"   ⏳ Attente de l'activation...")
        waiter = dynamodb.get_waiter('table_exists')
        waiter.wait(TableName=table_name, WaiterConfig={'Delay': 5, 'MaxAttempts': 60})
        
        print(f"   ✅ Table {table_name} créée et active !")
        update_env_file("TABLE_CONNECTIONS", table_name)
        return table_name
        
    except Exception as e:
        print(f"   ❌ Erreur création table: {e}")
        return None

def create_websocket_api():
    """Crée l'API WebSocket dans API Gateway."""
    print("\n🔌 Configuration WebSocket API...")
    
    api_name = "limajs-realtime-api"
    
    try:
        # Vérifier si l'API existe déjà
        apis = apigatewayv2.get_apis()
        existing_api = None
        for api in apis.get('Items', []):
            if api['Name'] == api_name:
                existing_api = api
                print(f"   ℹ️ WebSocket API {api_name} existe déjà.")
                break
        
        if existing_api:
            api_id = existing_api['ApiId']
            api_endpoint = existing_api['ApiEndpoint']
        else:
            # Créer l'API WebSocket
            print(f"   📡 Création de WebSocket API : {api_name}...")
            response = apigatewayv2.create_api(
                Name=api_name,
                ProtocolType='WEBSOCKET',
                RouteSelectionExpression='$request.body.action',
                Description='WebSocket API pour le tracking GPS temps réel LimaJS'
            )
            
            api_id = response['ApiId']
            api_endpoint = response['ApiEndpoint']
            print(f"   ✅ WebSocket API créée : {api_id}")
        
        # Créer les routes de base ($connect, $disconnect, $default)
        print(f"   🛤️ Configuration des routes WebSocket...")
        
        routes_to_create = ['$connect', '$disconnect', '$default']
        existing_routes = apigatewayv2.get_routes(ApiId=api_id).get('Items', [])
        existing_route_keys = [r['RouteKey'] for r in existing_routes]
        
        for route_key in routes_to_create:
            if route_key not in existing_route_keys:
                apigatewayv2.create_route(
                    ApiId=api_id,
                    RouteKey=route_key
                )
                print(f"      ✅ Route {route_key} créée")
            else:
                print(f"      ℹ️ Route {route_key} existe déjà")
        
        # Créer un stage (dev)
        print(f"   🚀 Configuration du stage 'production'...")
        try:
            apigatewayv2.create_stage(
                ApiId=api_id,
                StageName='production',
                AutoDeploy=True,
                Description='Production stage'
            )
            print(f"      ✅ Stage 'production' créé")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConflictException':
                print(f"      ℹ️ Stage 'production' existe déjà")
            else:
                raise
        
        # URL finale
        ws_url = f"{api_endpoint}/production"
        
        print(f"   ✅ WebSocket API prête !")
        print(f"   🔗 URL: {ws_url}")
        
        update_env_file("VITE_WEBSOCKET_URL", ws_url)
        update_env_file("WEBSOCKET_API_ID", api_id)
        
        return api_id, ws_url
        
    except Exception as e:
        print(f"   ❌ Erreur WebSocket API: {e}")
        return None, None

def print_next_steps(api_id):
    """Affiche les étapes suivantes manuelles."""
    print("\n📋 Prochaines Étapes (Manuelles):")
    print("\n1️⃣  Déployer les Lambda WebSocket:")
    print("   - backend/lambda/websocket/connect.py")
    print("   - backend/lambda/websocket/disconnect.py")
    print("   - backend/lambda/websocket/subscribe.py")
    print("   - backend/lambda/websocket/broadcast.py")
    
    if api_id:
        print(f"\n2️⃣  Lier les Lambda aux routes WebSocket (API ID: {api_id}):")
        print("   Console AWS > API Gateway > limajs-realtime-api")
        print("   - Route $connect -> Lambda connect")
        print("   - Route $disconnect -> Lambda disconnect")
        print("   - Route $default -> Lambda subscribe")
    
    print("\n3️⃣  Configurer EventBridge:")
    print("   - Créer une règle pour Location Tracker events")
    print("   - Target: Lambda broadcast")

def main():
    print("🚀 Provisioning Infrastructure Temps Réel pour LimaJS...\n")
    
    try:
        # 1. Table Connections
        table_name = create_connections_table()
        
        # 2. WebSocket API
        api_id, ws_url = create_websocket_api()
        
        if table_name and api_id:
            print("\n🎉 Infrastructure Temps Réel configurée !")
            print_next_steps(api_id)
        else:
            print("\n⚠️ Certaines ressources n'ont pas été créées. Vérifiez les erreurs ci-dessus.")
            
    except Exception as e:
        print(f"\n❌ Erreur Globale: {e}")

if __name__ == '__main__':
    main()

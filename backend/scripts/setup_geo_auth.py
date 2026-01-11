import boto3
import os
import time
from botocore.exceptions import ClientError, EndpointConnectionError

# Configuration
AWS_REGION = "us-east-1"
ENV_FILE_PATH = "../../.env"
ENV_EXAMPLE_PATH = "../../.env.example"

# Clients
location = boto3.client('location', region_name=AWS_REGION)
cognito = boto3.client('cognito-idp', region_name=AWS_REGION)

def update_env_file(key, value):
    # Lecture du fichier existant
    content = ""
    if os.path.exists(ENV_FILE_PATH):
        with open(ENV_FILE_PATH, "r") as f:
            content = f.read()

    # Si la clé existe déjà, on la remplace, sinon on l'ajoute
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
    
    # Faire de même pour .env.example (juste append si pas là)
    if os.path.exists(ENV_EXAMPLE_PATH):
        with open(ENV_EXAMPLE_PATH, "a") as f:
             # Check if key exists in example to avoid duplicates
            pass # Simplification: on mettra à jour l'exemple manuellement ou via une autre passe si nécessaire
    
    print(f"   📝 Config {key} mise à jour.")

def setup_location_service():
    print("\n🌍 Configuration Amazon Location Service...")
    
    # 1. CREATE MAP (OpenData Standard Light)
    map_name = "limajs-map-standard"
    try:
        print(f"   🗺️ Création de la carte : {map_name}...")
        location.create_map(
            MapName=map_name,
            Configuration={
                'Style': 'VectorOpenDataStandardLight' # Style OpenStreetMap
            },
            Description="Carte pour LimaJS Motors (OpenData)"
        )
        print(f"   ✅ Carte créée.")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
            print(f"   ℹ️ La carte {map_name} existe déjà.")
        else:
            print(f"   ❌ Erreur Carte: {e}")

    update_env_file("AWS_LOCATION_MAP_NAME", map_name)

    # 2. CREATE TRACKER
    tracker_name = "limajs-bus-tracker"
    try:
        print(f"   📍 Création du tracker : {tracker_name}...")
        location.create_tracker(
            TrackerName=tracker_name,
            Description="Tracker pour les bus LimaJS",
            PositionFiltering='TimeBased' # Optimisation coûts/précision
        )
        print(f"   ✅ Tracker créé.")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
            print(f"   ℹ️ Le tracker {tracker_name} existe déjà.")
        else:
            print(f"   ❌ Erreur Tracker: {e}")
            
    update_env_file("AWS_LOCATION_TRACKER_NAME", tracker_name)

def setup_cognito():
    print("\n🔐 Configuration Amazon Cognito...")
    
    pool_name = "limajs-user-pool"
    pool_id = None
    
    # 1. CHECK EXISTING POOLS
    try:
        response = cognito.list_user_pools(MaxResults=10)
        for pool in response['UserPools']:
            if pool['Name'] == pool_name:
                pool_id = pool['Id']
                print(f"   ℹ️ User Pool {pool_name} trouvé: {pool_id}")
                break
    except ClientError as e:
        print(f"   ❌ Erreur List Pools: {e}")
        return

    # 2. CREATE USER POOL IF NOT EXISTS
    if not pool_id:
        try:
            print(f"   👤 Création du User Pool : {pool_name}...")
            response = cognito.create_user_pool(
                PoolName=pool_name,
                Policies={
                    'PasswordPolicy': {
                        'MinimumLength': 8,
                        'RequireUppercase': True,
                        'RequireLowercase': True,
                        'RequireNumbers': True,
                        'RequireSymbols': False
                    }
                },
                AutoVerifiedAttributes=['email'],
                UsernameAttributes=['email'], # Login avec email
                MfaConfiguration='OFF', # On pourra activer plus tard
                Schema=[
                    {
                        'Name': 'email',
                        'Required': True,
                        'Mutable': True
                    },
                    {
                        'Name': 'name',
                        'Required': True,
                        'Mutable': True
                    },
                    {
                        'Name': 'phone_number', # Optionnel mais recommandé
                        'Required': False,
                        'Mutable': True
                    }
                ]
                # Note: Le trigger Lambda pour Resend sera configuré manuellement plus tard
                # Via LambdaConfig={'CustomEmailSender': ...}
            )
            pool_id = response['UserPool']['Id']
            print(f"   ✅ User Pool créé: {pool_id}")
        except ClientError as e:
            print(f"   ❌ Erreur Création Pool: {e}")
            return

    update_env_file("VITE_COGNITO_USER_POOL_ID", pool_id)

    # 3. CREATE APP CLIENT
    client_name = "limajs-app-client"
    client_id = None
    
    # Check existing clients
    try:
        response = cognito.list_user_pool_clients(UserPoolId=pool_id, MaxResults=10)
        for client in response['UserPoolClients']:
            if client['ClientName'] == client_name:
                client_id = client['ClientId']
                print(f"   ℹ️ App Client {client_name} trouvé: {client_id}")
                break
    except ClientError as e:
        print(f"   ❌ Erreur List Clients: {e}")

    if not client_id:
        try:
            print(f"   📱 Création du App Client : {client_name}...")
            response = cognito.create_user_pool_client(
                UserPoolId=pool_id,
                ClientName=client_name,
                GenerateSecret=False, # False pour usage Frontend (SPA)
                ExplicitAuthFlows=[
                    'ALLOW_USER_SRP_AUTH',
                    'ALLOW_REFRESH_TOKEN_AUTH',
                    'ALLOW_USER_PASSWORD_AUTH'
                ],
                PreventUserExistenceErrors='ENABLED'
            )
            client_id = response['UserPoolClient']['ClientId']
            print(f"   ✅ App Client créé: {client_id}")
        except ClientError as e:
            print(f"   ❌ Erreur Création Client: {e}")
            return

    update_env_file("VITE_COGNITO_CLIENT_ID", client_id)

def main():
    print("🚀 Provisionning des ressources Geo & Auth pour LimaJS...\n")
    try:
        setup_location_service()
        setup_cognito()
        print("\n🎉 Terminé ! Ressources créées et .env mis à jour.")
    except Exception as e:
        print(f"\n❌ Erreur Globale: {e}")

if __name__ == '__main__':
    main()

import boto3
import os
import time
from botocore.exceptions import ClientError, EndpointConnectionError

# Configuration
AWS_REGION = "us-east-1"  # Changez si nécessaire
ENV_FILE_PATH = "../../.env"
ENV_EXAMPLE_PATH = "../../.env.example"

# Initialisation du client DynamoDB
dynamodb = boto3.client('dynamodb', region_name=AWS_REGION)

def table_exists(table_name):
    """Vérifie si une table existe déjà."""
    try:
        dynamodb.describe_table(TableName=table_name)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            return False
        raise

def create_table(table_def):
    table_name = table_def['TableName']
    print(f"� Vérification de la table : {table_name}...")

    try:
        if table_exists(table_name):
            print(f"   ℹ️ La table {table_name} existe déjà. Passage à la suivante.")
            return True

        print(f"   📦 Création de la table : {table_name}...")
        dynamodb.create_table(**table_def)
        print(f"   ⏳ Création initiée, attente de l'activation...")
        
        waiter = dynamodb.get_waiter('table_exists')
        # Attente plus longue pour éviter les timeouts
        waiter.wait(TableName=table_name, WaiterConfig={'Delay': 5, 'MaxAttempts': 60})
        
        print(f"   ✅ Table {table_name} créée et active !")
        return True

    except (ClientError, EndpointConnectionError) as e:
        if isinstance(e, ClientError) and e.response['Error']['Code'] == 'ResourceInUseException':
            print(f"   ⚠️ La table {table_name} est en cours de création ou existe déjà.")
            return True
        else:
            print(f"   ❌ Erreur CRITIQUE sur {table_name}: {e}")
            print("   ⚠️ Vérifiez votre connexion internet !")
            return False
    except Exception as e:
        print(f"   ❌ Erreur inattendue : {e}")
        return False

def enable_ttl(table_name, attribute_name):
    print(f"   ⏲️ Configuration du TTL pour {table_name} sur le champ '{attribute_name}'...")
    try:
        dynamodb.update_time_to_live(
            TableName=table_name,
            TimeToLiveSpecification={
                'Enabled': True,
                'AttributeName': attribute_name
            }
        )
        print("   ✅ TTL activé.")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ValidationException' and 'already enabled' in str(e):
             print("   ✅ TTL était déjà activé.")
        else:
            print(f"   ❌ Erreur TTL: {e}")

def update_env_files(tables):
    print("\n📝 Mise à jour des fichiers d'environnement...")
    
    env_vars = "\n# AWS DynamoDB Tables\n"
    for name in tables:
        # PASCAL_CASE convention
        var_name = "TABLE_" + name.replace("limajs-", "").replace("-", "_").upper()
        env_vars += f"{var_name}={name}\n"

    # Update .env
    if os.path.exists(ENV_FILE_PATH):
        with open(ENV_FILE_PATH, "a") as f:
            f.write(env_vars)
        print(f"   ✅ {ENV_FILE_PATH} mis à jour.")
    else:
        print(f"   ⚠️ {ENV_FILE_PATH} introuvable, création...")
        with open(ENV_FILE_PATH, "w") as f:
            f.write(env_vars)
            
    # Update .env.example
    if os.path.exists(ENV_EXAMPLE_PATH):
        with open(ENV_EXAMPLE_PATH, "a") as f:
            f.write(env_vars)
        print(f"   ✅ {ENV_EXAMPLE_PATH} mis à jour.")

def main():
    print("🚀 Démarrage du déploiement DynamoDB pour LimaJS Motors\n")
    
    tables_created = []

    # 1. USERS
    users_def = {
        'TableName': 'limajs-users',
        'KeySchema': [
            {'AttributeName': 'userId', 'KeyType': 'HASH'},
            {'AttributeName': 'type', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'userId', 'AttributeType': 'S'},
            {'AttributeName': 'type', 'AttributeType': 'S'},
            {'AttributeName': 'email', 'AttributeType': 'S'},
            {'AttributeName': 'phone', 'AttributeType': 'S'},
            {'AttributeName': 'role', 'AttributeType': 'S'},
            {'AttributeName': 'createdAt', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'email-index',
                'KeySchema': [{'AttributeName': 'email', 'KeyType': 'HASH'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'phone-index',
                'KeySchema': [{'AttributeName': 'phone', 'KeyType': 'HASH'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'role-index',
                'KeySchema': [
                    {'AttributeName': 'role', 'KeyType': 'HASH'},
                    {'AttributeName': 'createdAt', 'KeyType': 'RANGE'}
                ],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    if create_table(users_def): tables_created.append('limajs-users')

    # 2. BUSES
    buses_def = {
        'TableName': 'limajs-buses',
        'KeySchema': [
            {'AttributeName': 'busId', 'KeyType': 'HASH'},
            {'AttributeName': 'type', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'busId', 'AttributeType': 'S'},
            {'AttributeName': 'type', 'AttributeType': 'S'},
            {'AttributeName': 'status', 'AttributeType': 'S'},
            {'AttributeName': 'plateNumber', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'status-index',
                'KeySchema': [{'AttributeName': 'status', 'KeyType': 'HASH'}, {'AttributeName': 'busId', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'plate-index',
                'KeySchema': [{'AttributeName': 'plateNumber', 'KeyType': 'HASH'}, {'AttributeName': 'busId', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    if create_table(buses_def): tables_created.append('limajs-buses')

    # 3. ROUTES
    routes_def = {
        'TableName': 'limajs-routes',
        'KeySchema': [
            {'AttributeName': 'routeId', 'KeyType': 'HASH'},
            {'AttributeName': 'type', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'routeId', 'AttributeType': 'S'},
            {'AttributeName': 'type', 'AttributeType': 'S'},
            {'AttributeName': 'shortCode', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'shortcode-index',
                'KeySchema': [{'AttributeName': 'shortCode', 'KeyType': 'HASH'}, {'AttributeName': 'routeId', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    if create_table(routes_def): tables_created.append('limajs-routes')

    # 4. SCHEDULES
    schedules_def = {
        'TableName': 'limajs-schedules',
        'KeySchema': [
            {'AttributeName': 'routeId', 'KeyType': 'HASH'},
            {'AttributeName': 'scheduleId', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'routeId', 'AttributeType': 'S'},
            {'AttributeName': 'scheduleId', 'AttributeType': 'S'},
            {'AttributeName': 'assignedDriverId', 'AttributeType': 'S'},
            {'AttributeName': 'deploymentTime', 'AttributeType': 'S'}, # departureTime mapped
            {'AttributeName': 'assignedBusId', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'driver-schedules',
                'KeySchema': [{'AttributeName': 'assignedDriverId', 'KeyType': 'HASH'}, {'AttributeName': 'deploymentTime', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'bus-schedules',
                'KeySchema': [{'AttributeName': 'assignedBusId', 'KeyType': 'HASH'}, {'AttributeName': 'deploymentTime', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    # Note: attribute names in KeySchema must match AttributeDefinitions. I used deploymentTime to represent departureTime for uniqueness if needed or just time mapping
    # Correction: The schema said 'departureTime'. Let's use that.
    schedules_def['AttributeDefinitions'][3]['AttributeName'] = 'departureTime'
    schedules_def['GlobalSecondaryIndexes'][0]['KeySchema'][1]['AttributeName'] = 'departureTime'
    schedules_def['GlobalSecondaryIndexes'][1]['KeySchema'][1]['AttributeName'] = 'departureTime'
    
    if create_table(schedules_def): tables_created.append('limajs-schedules')

    # 5. SUBSCRIPTIONS
    subs_def = {
        'TableName': 'limajs-subscriptions',
        'KeySchema': [
            {'AttributeName': 'pk', 'KeyType': 'HASH'},
            {'AttributeName': 'sk', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'pk', 'AttributeType': 'S'},
            {'AttributeName': 'sk', 'AttributeType': 'S'},
            {'AttributeName': 'status', 'AttributeType': 'S'},
            {'AttributeName': 'endDate', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'status-enddate',
                'KeySchema': [{'AttributeName': 'status', 'KeyType': 'HASH'}, {'AttributeName': 'endDate', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'expiring-soon',
                'KeySchema': [{'AttributeName': 'status', 'KeyType': 'HASH'}, {'AttributeName': 'endDate', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    if create_table(subs_def): tables_created.append('limajs-subscriptions')

    # 6. PAYMENTS
    payments_def = {
        'TableName': 'limajs-payments',
        'KeySchema': [
            {'AttributeName': 'userId', 'KeyType': 'HASH'},
            {'AttributeName': 'paymentId', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'userId', 'AttributeType': 'S'},
            {'AttributeName': 'paymentId', 'AttributeType': 'S'},
            {'AttributeName': 'status', 'AttributeType': 'S'},
            {'AttributeName': 'submittedAt', 'AttributeType': 'S'},
            {'AttributeName': 'GSI1PK', 'AttributeType': 'S'} # For date-index
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'status-date',
                'KeySchema': [{'AttributeName': 'status', 'KeyType': 'HASH'}, {'AttributeName': 'submittedAt', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'date-index',
                'KeySchema': [{'AttributeName': 'GSI1PK', 'KeyType': 'HASH'}, {'AttributeName': 'submittedAt', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    if create_table(payments_def): tables_created.append('limajs-payments')

    # 7. TICKETS (On-Demand + TTL)
    tickets_def = {
        'TableName': 'limajs-tickets',
        'KeySchema': [
            {'AttributeName': 'userId', 'KeyType': 'HASH'},
            {'AttributeName': 'ticketId', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'userId', 'AttributeType': 'S'},
            {'AttributeName': 'ticketId', 'AttributeType': 'S'},
            {'AttributeName': 'tokenHash', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'token-index',
                'KeySchema': [{'AttributeName': 'tokenHash', 'KeyType': 'HASH'}, {'AttributeName': 'ticketId', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'}
            }
        ],
        'BillingMode': 'PAY_PER_REQUEST'
    }
    if create_table(tickets_def):
        enable_ttl('limajs-tickets', 'ttl')
        tables_created.append('limajs-tickets')

    # 8. NFC CARDS (New!)
    nfc_def = {
        'TableName': 'limajs-nfc-cards',
        'KeySchema': [
            {'AttributeName': 'userId', 'KeyType': 'HASH'},
            {'AttributeName': 'cardId', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'userId', 'AttributeType': 'S'},
            {'AttributeName': 'cardId', 'AttributeType': 'S'},
            {'AttributeName': 'nfcUidHash', 'AttributeType': 'S'},
            {'AttributeName': 'cardNumber', 'AttributeType': 'S'},
            {'AttributeName': 'status', 'AttributeType': 'S'},
            {'AttributeName': 'expiresAt', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'nfc-uid-index',
                'KeySchema': [{'AttributeName': 'nfcUidHash', 'KeyType': 'HASH'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'card-number-index',
                'KeySchema': [{'AttributeName': 'cardNumber', 'KeyType': 'HASH'}],
                'Projection': {'ProjectionType': 'KEYS_ONLY'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 2}
            },
            {
                'IndexName': 'status-index',
                'KeySchema': [{'AttributeName': 'status', 'KeyType': 'HASH'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 2}
            },
            {
                'IndexName': 'expiry-index',
                'KeySchema': [{'AttributeName': 'status', 'KeyType': 'HASH'}, {'AttributeName': 'expiresAt', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 2}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    if create_table(nfc_def): tables_created.append('limajs-nfc-cards')

    # 9. TRIPS
    trips_def = {
        'TableName': 'limajs-trips',
        'KeySchema': [
            {'AttributeName': 'tripId', 'KeyType': 'HASH'},
            {'AttributeName': 'type', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'tripId', 'AttributeType': 'S'},
            {'AttributeName': 'type', 'AttributeType': 'S'},
            {'AttributeName': 'driverId', 'AttributeType': 'S'},
            {'AttributeName': 'date', 'AttributeType': 'S'},
            {'AttributeName': 'busId', 'AttributeType': 'S'},
            {'AttributeName': 'routeId', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'driver-trips',
                'KeySchema': [{'AttributeName': 'driverId', 'KeyType': 'HASH'}, {'AttributeName': 'date', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'bus-trips',
                'KeySchema': [{'AttributeName': 'busId', 'KeyType': 'HASH'}, {'AttributeName': 'date', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'route-trips',
                'KeySchema': [{'AttributeName': 'routeId', 'KeyType': 'HASH'}, {'AttributeName': 'date', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'date-index',
                'KeySchema': [{'AttributeName': 'date', 'KeyType': 'HASH'}, {'AttributeName': 'tripId', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    if create_table(trips_def): tables_created.append('limajs-trips')

    # 10. GPS POSITIONS (On-Demand + TTL)
    gps_def = {
        'TableName': 'limajs-gps-positions',
        'KeySchema': [
            {'AttributeName': 'busId', 'KeyType': 'HASH'},
            {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'busId', 'AttributeType': 'S'},
            {'AttributeName': 'timestamp', 'AttributeType': 'S'},
            {'AttributeName': 'tripId', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'trip-positions',
                'KeySchema': [{'AttributeName': 'tripId', 'KeyType': 'HASH'}, {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}],
                'Projection': {'ProjectionType': 'ALL'}
            }
        ],
        'BillingMode': 'PAY_PER_REQUEST'
    }
    if create_table(gps_def):
        enable_ttl('limajs-gps-positions', 'ttl')
        tables_created.append('limajs-gps-positions')

    # Update .env
    update_env_files(tables_created)

    print("\n🎉 Terminé ! Infrastructure DynamoDB prête.")

if __name__ == '__main__':
    main()

"""
Script pour créer les nouvelles tables DynamoDB :
- limajs-invoices
- limajs-wallet-transactions
- limajs-passenger-trips (pour l'historique des trajets passagers)
"""

import boto3
from botocore.exceptions import ClientError
import time

AWS_REGION = "us-east-1"
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
    print(f"🔍 Vérification de la table : {table_name}...")

    try:
        if table_exists(table_name):
            print(f"   ✅ La table {table_name} existe déjà.")
            return True

        print(f"   📦 Création de la table : {table_name}...")
        dynamodb.create_table(**table_def)
        
        waiter = dynamodb.get_waiter('table_exists')
        waiter.wait(TableName=table_name, WaiterConfig={'Delay': 3, 'MaxAttempts': 30})
        
        print(f"   ✅ Table {table_name} créée !")
        return True

    except Exception as e:
        print(f"   ❌ Erreur : {e}")
        return False


def main():
    print("🚀 Création des nouvelles tables DynamoDB\n")
    
    # 1. INVOICES
    invoices_def = {
        'TableName': 'limajs-invoices',
        'KeySchema': [
            {'AttributeName': 'invoiceId', 'KeyType': 'HASH'},
            {'AttributeName': 'userId', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'invoiceId', 'AttributeType': 'S'},
            {'AttributeName': 'userId', 'AttributeType': 'S'},
            {'AttributeName': 'status', 'AttributeType': 'S'},
            {'AttributeName': 'dueDate', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'status-duedate',
                'KeySchema': [
                    {'AttributeName': 'status', 'KeyType': 'HASH'},
                    {'AttributeName': 'dueDate', 'KeyType': 'RANGE'}
                ],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            },
            {
                'IndexName': 'user-invoices',
                'KeySchema': [
                    {'AttributeName': 'userId', 'KeyType': 'HASH'},
                    {'AttributeName': 'dueDate', 'KeyType': 'RANGE'}
                ],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    create_table(invoices_def)
    
    # 2. WALLET TRANSACTIONS
    wallet_tx_def = {
        'TableName': 'limajs-wallet-transactions',
        'KeySchema': [
            {'AttributeName': 'userId', 'KeyType': 'HASH'},
            {'AttributeName': 'transactionId', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'userId', 'AttributeType': 'S'},
            {'AttributeName': 'transactionId', 'AttributeType': 'S'},
            {'AttributeName': 'createdAt', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'user-date',
                'KeySchema': [
                    {'AttributeName': 'userId', 'KeyType': 'HASH'},
                    {'AttributeName': 'createdAt', 'KeyType': 'RANGE'}
                ],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    create_table(wallet_tx_def)
    
    # 3. PASSENGER TRIPS (for trip history)
    passenger_trips_def = {
        'TableName': 'limajs-passenger-trips',
        'KeySchema': [
            {'AttributeName': 'passengerId', 'KeyType': 'HASH'},
            {'AttributeName': 'tripId', 'KeyType': 'RANGE'}
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'passengerId', 'AttributeType': 'S'},
            {'AttributeName': 'tripId', 'AttributeType': 'S'},
            {'AttributeName': 'date', 'AttributeType': 'S'}
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'passenger-date',
                'KeySchema': [
                    {'AttributeName': 'passengerId', 'KeyType': 'HASH'},
                    {'AttributeName': 'date', 'KeyType': 'RANGE'}
                ],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            }
        ],
        'BillingMode': 'PROVISIONED',
        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    }
    create_table(passenger_trips_def)
    
    print("\n🎉 Toutes les tables ont été créées !")
    print("\nTables créées:")
    print("  - limajs-invoices")
    print("  - limajs-wallet-transactions")
    print("  - limajs-passenger-trips")


if __name__ == '__main__':
    main()

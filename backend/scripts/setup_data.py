import boto3
import time
import os
import sys

# Configure stdout for Windows
sys.stdout.reconfigure(encoding='utf-8')

dynamodb = boto3.client('dynamodb', region_name='us-east-1')

TABLE_SUBSCRIPTIONS = 'limajs-subscriptions'
TABLE_USERS = 'limajs-users'
TABLE_TICKETS = 'limajs-tickets'

def create_gsi():
    print(f"Checking GSI 'user-status-index' on {TABLE_SUBSCRIPTIONS}...")
    try:
        response = dynamodb.describe_table(TableName=TABLE_SUBSCRIPTIONS)
        gsis = response['Table'].get('GlobalSecondaryIndexes', [])
        gsi_names = [g['IndexName'] for g in gsis]
        
        if 'user-status-index' in gsi_names:
            print("GSI 'user-status-index' already exists.")
            return

        print("Creating GSI 'user-status-index'...")
        dynamodb.update_table(
            TableName=TABLE_SUBSCRIPTIONS,
            AttributeDefinitions=[
                {'AttributeName': 'userId', 'AttributeType': 'S'},
                {'AttributeName': 'status', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexUpdates=[
                {
                    'Create': {
                        'IndexName': 'user-status-index',
                        'KeySchema': [
                            {'AttributeName': 'userId', 'KeyType': 'HASH'},
                            {'AttributeName': 'status', 'KeyType': 'RANGE'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'},
                        'ProvisionedThroughput': {
                            'ReadCapacityUnits': 5,
                            'WriteCapacityUnits': 5
                        }
                    }
                }
            ]
        )
        print("GSI creation initiated for subscriptions. This may take a few minutes.")
        
    except Exception as e:
        print(f"Error creating GSI for subscriptions: {e}")

def create_tickets_gsi():
    print(f"Checking GSI 'user-tickets-index' on {TABLE_TICKETS}...")
    try:
        response = dynamodb.describe_table(TableName=TABLE_TICKETS)
        gsis = response['Table'].get('GlobalSecondaryIndexes', [])
        gsi_names = [g['IndexName'] for g in gsis]
        
        if 'user-tickets-index' in gsi_names:
            print("GSI 'user-tickets-index' already exists.")
            return

        print("Creating GSI 'user-tickets-index'...")
        dynamodb.update_table(
            TableName=TABLE_TICKETS,
            AttributeDefinitions=[
                {'AttributeName': 'userId', 'AttributeType': 'S'},
                {'AttributeName': 'createdAt', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexUpdates=[
                {
                    'Create': {
                        'IndexName': 'user-tickets-index',
                        'KeySchema': [
                            {'AttributeName': 'userId', 'KeyType': 'HASH'},
                            {'AttributeName': 'createdAt', 'KeyType': 'RANGE'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'}
                    }
                }
            ]
        )
        print("GSI creation initiated for tickets.")
        
    except Exception as e:
        print(f"Error creating GSI for tickets: {e}")

def create_user_profiles():
    print(f"\nCreating/Updating user profiles in {TABLE_USERS}...")
    
    # User IDs from Cognito (retrieved via script or hardcoded if matching test_api logic)
    # Since we don't have exact subs easily here without login, we rely on test_api to print them 
    # or we fetch them now.
    
    cognito = boto3.client('cognito-idp', region_name='us-east-1')
    
    # We need the User Pool ID. It's in .env or passed as env var.
    # I'll try to find it or fetch it.
    try:
        paginator = cognito.get_paginator('list_user_pools')
        pools = paginator.paginate(MaxResults=10).build_full_result()
        user_pool_id = None
        for pool in pools['UserPools']:
            if 'limajs' in pool['Name'].lower():
                user_pool_id = pool['Id']
                break
        
        if not user_pool_id:
            print("Could not find Cognito User Pool.")
            return

        users_to_create = [
            {'email': 'test.passenger@limajs.com', 'role': 'PASSENGER', 'name': 'Test Passenger'},
            {'email': 'test.driver@limajs.com', 'role': 'DRIVER', 'name': 'Test Driver'},
            {'email': 'test.admin@limajs.com', 'role': 'ADMIN', 'name': 'Test Admin'}
        ]

        for user_data in users_to_create:
            # Get user sub
            try:
                resp = cognito.admin_get_user(
                    UserPoolId=user_pool_id,
                    Username=user_data['email']
                )
                sub = next(a['Value'] for a in resp['UserAttributes'] if a['Name'] == 'sub')
                user_id = f"USER#{sub}"
                
                # Create profile in DynamoDB
                item = {
                    'userId': {'S': user_id},
                    'type': {'S': 'PROFILE'},
                    'email': {'S': user_data['email']},
                    'name': {'S': user_data['name']},
                    'role': {'S': user_data['role']},
                    'isActive': {'BOOL': True},
                    'walletBalance': {'N': '1000'},
                    'walletCurrency': {'S': 'HTG'},
                    'createdAt': {'S': time.strftime('%Y-%m-%dT%H:%M:%SZ')},
                    'updatedAt': {'S': time.strftime('%Y-%m-%dT%H:%M:%SZ')}
                }
                
                # Verify existing first to not overwrite balances if re-running
                try:
                    dynamodb.put_item(
                        TableName=TABLE_USERS,
                        Item=item,
                        ConditionExpression='attribute_not_exists(userId)'
                    )
                    print(f"Created profile for {user_data['email']} ({user_id})")
                except dynamodb.exceptions.ConditionalCheckFailedException:
                    print(f"Profile for {user_data['email']} already exists. Updating role only.")
                    dynamodb.update_item(
                        TableName=TABLE_USERS,
                        Key={'userId': {'S': user_id}, 'type': {'S': 'PROFILE'}},
                        UpdateExpression='SET #role = :role',
                        ExpressionAttributeNames={'#role': 'role'},
                        ExpressionAttributeValues={':role': {'S': user_data['role']}}
                    )
                
            except cognito.exceptions.UserNotFoundException:
                print(f"User {user_data['email']} not found in Cognito. Skipping.")
            except Exception as e:
                print(f"Error creating profile for {user_data['email']}: {e}")

    except Exception as e:
        print(f"Error in create_user_profiles: {e}")

if __name__ == "__main__":
    create_gsi()
    create_tickets_gsi()
    create_user_profiles()

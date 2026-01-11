import json
import os
import sys
import boto3
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error, get_http_method, get_path_parameters
from shared.db import query_items, scan_items, convert_floats
from boto3.dynamodb.conditions import Key, Attr

# Tables
TABLE_USERS = os.environ.get('TABLE_USERS', 'limajs-users')
TABLE_SUBSCRIPTIONS = os.environ.get('TABLE_SUBSCRIPTIONS', 'limajs-subscriptions')
TABLE_PAYMENTS = os.environ.get('TABLE_PAYMENTS', 'limajs-payments')
TABLE_TRIPS = os.environ.get('TABLE_TRIPS', 'limajs-trips')

# Cognito client
cognito = boto3.client('cognito-idp')
USER_POOL_ID = os.environ.get('VITE_COGNITO_USER_POOL_ID')

def lambda_handler(event, context):
    """
    Handler pour gestion admin des utilisateurs.
    Routes:
    - GET /admin/users -> Liste tous les utilisateurs
    - GET /admin/users/{userId} -> Détails d'un utilisateur
    - PUT /admin/users/{userId}/suspend -> Suspendre un utilisateur
    - PUT /admin/users/{userId}/activate -> Réactiver un utilisateur
    - GET /admin/users/{userId}/activity -> Activité d'un utilisateur
    """
    """
    http_method = get_http_method(event)
    path = event.get('rawPath') or event.get('path', '')
    path_parameters = get_path_parameters(event)
    
    try:
        if '/suspend' in path and http_method == 'PUT':
            return suspend_user(path_parameters['userId'])
        elif '/activate' in path and http_method == 'PUT':
            return activate_user(path_parameters['userId'])
        elif '/activity' in path and http_method == 'GET':
            return get_user_activity(path_parameters['userId'])
        elif path_parameters.get('userId') and http_method == 'GET':
            return get_user_details(path_parameters['userId'])
        elif http_method == 'GET':
            return list_users(event)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def list_users(event):
    """Liste tous les utilisateurs avec pagination."""
    query_params = event.get('queryStringParameters') or {}
    role_filter = query_params.get('role')  # PASSENGER, DRIVER, ADMIN
    limit = int(query_params.get('limit', 50))
    
    try:
        # Récupérer les utilisateurs depuis Cognito
        params = {
            'UserPoolId': USER_POOL_ID,
            'Limit': limit
        }
        
        if role_filter:
            params['Filter'] = f'custom:role = "{role_filter}"'
        
        response = cognito.list_users(**params)
        
        users = []
        for user in response.get('Users', []):
            user_data = {
                'username': user['Username'],
                'status': user['UserStatus'],
                'enabled': user['Enabled'],
                'createdAt': user['UserCreateDate'].isoformat(),
                'lastModified': user['UserLastModifiedDate'].isoformat()
            }
            
            # Extraire attributs
            for attr in user.get('Attributes', []):
                if attr['Name'] == 'email':
                    user_data['email'] = attr['Value']
                elif attr['Name'] == 'custom:role':
                    user_data['role'] = attr['Value']
                elif attr['Name'] == 'name':
                    user_data['name'] = attr['Value']
                elif attr['Name'] == 'sub':
                    user_data['userId'] = f"USER#{attr['Value']}"
            
            users.append(user_data)
        
        return success({
            'users': users,
            'count': len(users)
        })
        
    except Exception as e:
        print(f"Error listing users: {e}")
        return error(500, str(e))

def get_user_details(user_id):
    """Détails complets d'un utilisateur (Cognito + DynamoDB)."""
    full_user_id = f"USER#{user_id}" if not user_id.startswith('USER#') else user_id
    
    # Profil DynamoDB
    from shared.db import get_item
    profile = get_item(TABLE_USERS, {'userId': full_user_id, 'type': 'PROFILE'})
    
    # Abonnement actif
    subscriptions = query_items(
        TABLE_SUBSCRIPTIONS,
        Key('userId').eq(full_user_id),
        Attr('status').eq('ACTIVE')
    )
    
    # Paiements récents
    payments = scan_items(
        TABLE_PAYMENTS,
        Attr('userId').eq(full_user_id)
    )[:10]  # 10 derniers
    
    return success({
        'profile': profile,
        'activeSubscription': subscriptions[0] if subscriptions else None,
        'recentPayments': payments
    })

def suspend_user(user_id):
    """Suspendre un utilisateur (désactiver dans Cognito)."""
    try:
        # Trouver l'username Cognito
        full_user_id = f"USER#{user_id}" if not user_id.startswith('USER#') else user_id
        sub = user_id.replace('USER#', '')
        
        # Désactiver dans Cognito
        cognito.admin_disable_user(
            UserPoolId=USER_POOL_ID,
            Username=sub
        )
        
        # Mettre à jour le profil DynamoDB
        from shared.db import update_item
        update_item(
            TABLE_USERS,
            {'userId': full_user_id, 'type': 'PROFILE'},
            "SET #status = :status, suspendedAt = :suspended",
            {':status': 'SUSPENDED', ':suspended': datetime.utcnow().isoformat()},
            {'#status': 'status'}
        )
        
        return success({'userId': full_user_id}, "User suspended successfully")
        
    except Exception as e:
        print(f"Error suspending user: {e}")
        return error(500, str(e))

def activate_user(user_id):
    """Réactiver un utilisateur suspendu."""
    try:
        full_user_id = f"USER#{user_id}" if not user_id.startswith('USER#') else user_id
        sub = user_id.replace('USER#', '')
        
        # Réactiver dans Cognito
        cognito.admin_enable_user(
            UserPoolId=USER_POOL_ID,
            Username=sub
        )
        
        # Mettre à jour DynamoDB
        from shared.db import update_item
        update_item(
            TABLE_USERS,
            {'userId': full_user_id, 'type': 'PROFILE'},
            "SET #status = :status, reactivatedAt = :reactivated",
            {':status': 'ACTIVE', ':reactivated': datetime.utcnow().isoformat()},
            {'#status': 'status'}
        )
        
        return success({'userId': full_user_id}, "User activated successfully")
        
    except Exception as e:
        print(f"Error activating user: {e}")
        return error(500, str(e))

def get_user_activity(user_id):
    """Historique d'activité d'un utilisateur."""
    full_user_id = f"USER#{user_id}" if not user_id.startswith('USER#') else user_id
    
    # Voyages (en tant que passager)
    trips_as_passenger = scan_items(
        TABLE_TRIPS,
        Attr('passengerId').eq(full_user_id)
    )
    
    # Voyages (en tant que chauffeur)
    trips_as_driver = scan_items(
        TABLE_TRIPS,
        Attr('driverId').eq(full_user_id) & Attr('timestamp').exists()
    )
    
    # Paiements
    payments = scan_items(
        TABLE_PAYMENTS,
        Attr('userId').eq(full_user_id)
    )
    
    return success({
        'tripsAsPassenger': len(trips_as_passenger),
        'tripsAsDriver': len(trips_as_driver),
        'totalPayments': len(payments),
        'recentActivity': {
            'trips': trips_as_passenger[:5],
            'payments': payments[:5]
        }
    })

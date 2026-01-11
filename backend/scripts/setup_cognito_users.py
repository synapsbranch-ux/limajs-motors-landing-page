#!/usr/bin/env python3
"""
Script pour créer les utilisateurs de test dans Cognito
et les lier aux données seeded dans DynamoDB
"""

import boto3
import json

# Configuration
REGION = 'us-east-1'

# Trouver le User Pool ID dynamiquement
def find_user_pool():
    """Trouve le User Pool LimaJS"""
    cognito = boto3.client('cognito-idp', region_name=REGION)
    
    pools = cognito.list_user_pools(MaxResults=60)
    for pool in pools['UserPools']:
        if 'limajs' in pool['Name'].lower() or 'motor' in pool['Name'].lower():
            return pool['Id'], pool['Name']
    
    # Si pas trouvé, lister tous les pools
    print("Pools disponibles:")
    for pool in pools['UserPools']:
        print(f"  - {pool['Name']} ({pool['Id']})")
    
    return None, None

# Test users à créer (seulement attributs standards Cognito)
TEST_USERS = [
    {
        'email': 'admin@limajs.com',
        'password': 'LimajsAdmin2024!',
        'given_name': 'Jean',
        'family_name': 'Directeur',
        'role': 'admin'  # Stocké dans DynamoDB, pas Cognito
    },
    {
        'email': 'pierre.chauffeur@limajs.com',
        'password': 'LimajsDriver2024!',
        'given_name': 'Pierre',
        'family_name': 'Jean-Baptiste',
        'role': 'driver'
    },
    {
        'email': 'marie.chauffeur@limajs.com',
        'password': 'LimajsDriver2024!',
        'given_name': 'Marie',
        'family_name': 'Desrosiers',
        'role': 'driver'
    },
    {
        'email': 'client1@gmail.com',
        'password': 'LimajsPassenger2024!',
        'given_name': 'Jacques',
        'family_name': 'Bonhomme',
        'role': 'passenger'
    },
    {
        'email': 'client2@gmail.com',
        'password': 'LimajsPassenger2024!',
        'given_name': 'Sophie',
        'family_name': 'Laurent',
        'role': 'passenger'
    },
    {
        'email': 'client3@gmail.com',
        'password': 'LimajsPassenger2024!',
        'given_name': 'Marc',
        'family_name': 'Antoine',
        'role': 'passenger'
    },
]


def create_user(cognito, pool_id, user_data):
    """Crée un utilisateur dans Cognito"""
    email = user_data['email']
    password = user_data['password']
    
    # Seulement les attributs standards Cognito
    attributes = [
        {'Name': 'email', 'Value': email},
        {'Name': 'email_verified', 'Value': 'true'},
        {'Name': 'given_name', 'Value': user_data.get('given_name', '')},
        {'Name': 'family_name', 'Value': user_data.get('family_name', '')},
    ]
    
    try:
        # Create user
        response = cognito.admin_create_user(
            UserPoolId=pool_id,
            Username=email,
            UserAttributes=attributes,
            TemporaryPassword=password,
            MessageAction='SUPPRESS'  # Don't send welcome email
        )
        
        # Set permanent password
        cognito.admin_set_user_password(
            UserPoolId=pool_id,
            Username=email,
            Password=password,
            Permanent=True
        )
        
        print(f"  ✅ {email} créé avec succès")
        return True
        
    except cognito.exceptions.UsernameExistsException:
        print(f"  ⚠️ {email} existe déjà")
        return True
    except Exception as e:
        print(f"  ❌ Erreur pour {email}: {e}")
        return False


def main():
    print("🔐 LimaJS Motors - Setup Cognito Users")
    print("=" * 50)
    
    # Find User Pool
    pool_id, pool_name = find_user_pool()
    
    if not pool_id:
        print("\n❌ Aucun User Pool LimaJS trouvé!")
        print("Veuillez créer un User Pool ou spécifier l'ID manuellement.")
        
        # Option: créer un User Pool simple
        print("\nVoulez-vous créer un User Pool? (Ce script ne le fait pas automatiquement)")
        return
    
    print(f"\n📦 User Pool trouvé: {pool_name} ({pool_id})")
    
    cognito = boto3.client('cognito-idp', region_name=REGION)
    
    print("\n👥 Création des utilisateurs de test...")
    
    created = 0
    for user in TEST_USERS:
        if create_user(cognito, pool_id, user):
            created += 1
    
    print("\n" + "=" * 50)
    print(f"🎉 {created}/{len(TEST_USERS)} utilisateurs créés/vérifiés")
    
    print("\n📋 Credentials de test:")
    print("-" * 50)
    print(f"{'Email':<35} {'Password':<25} {'Role'}")
    print("-" * 50)
    for user in TEST_USERS:
        role = user.get('role', 'user')
        print(f"{user['email']:<35} {user['password']:<25} {role}")


if __name__ == "__main__":
    main()

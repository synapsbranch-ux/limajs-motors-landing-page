"""
Script GLOBAL de seeding LimaJS Motors
Ce script :
1. Crée les utilisateurs Cognito variés (Passenger, Driver, Admin)
2. Crée les cartes NFC (Hashed) et les lie aux utilisateurs
3. Met à jour les profils utilisateurs avec walletBalance, passengerType, etc.
"""

import boto3
import json
import time
import os
import hashlib
import random
from datetime import datetime
from botocore.exceptions import ClientError
from decimal import Decimal

# --- CONFIGURATION ---
AWS_REGION = "us-east-1"
USER_POOL_ID = None  # Will be auto-detected
CLIENT_ID = None     # Will be auto-detected

cognito = boto3.client('cognito-idp', region_name=AWS_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)

def get_user_pool_id():
    """Récupère dynamiquement l'ID du User Pool LimaJS"""
    response = cognito.list_user_pools(MaxResults=10)
    for pool in response['UserPools']:
        if 'limajs' in pool['Name'].lower():
            return pool['Id']
    raise Exception("❌ User Pool 'limajs' introuvable")

def get_client_id(user_pool_id):
    """Récupère le Client ID associé au User Pool"""
    response = cognito.list_user_pool_clients(UserPoolId=user_pool_id, MaxResults=10)
    if response['UserPoolClients']:
        return response['UserPoolClients'][0]['ClientId']
    raise Exception("❌ Aucun Client ID trouvé pour ce pool")

def hash_nfc_card(uid):
    """Hash l'UID NFC pour stockage sécurisé"""
    return hashlib.sha256(uid.encode('utf-8')).hexdigest()

def create_cognito_user(email, password, given_name, family_name, phone_number, role, user_pool_id):
    try:
        response = cognito.admin_create_user(
            UserPoolId=user_pool_id,
            Username=email,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'given_name', 'Value': given_name},
                {'Name': 'family_name', 'Value': family_name},
                {'Name': 'phone_number', 'Value': phone_number},
            ],
            MessageAction='SUPPRESS'
        )
        cognito.admin_set_user_password(
            UserPoolId=user_pool_id,
            Username=email,
            Password=password,
            Permanent=True
        )
        user_sub = response['User']['Username']
        print(f"✅ User créé: {email} ({role}) - SUB: {user_sub}")
        return user_sub
    except ClientError as e:
        if e.response['Error']['Code'] == 'UsernameExistsException':
            print(f"ℹ️ User existe déjà: {email}")
            # Get existing user SUB
            user = cognito.admin_get_user(UserPoolId=user_pool_id, Username=email)
            for attr in user['UserAttributes']:
                if attr['Name'] == 'sub':
                    return attr['Value']
        else:
            print(f"❌ Erreur création {email}: {e}")
            return None

def update_dynamo_profile(user_id, role, passenger_type='free', balance=0, nfc_hash=None):
    """Met à jour le profil dans DynamoDB avec les nouveaux champs"""
    table = dynamodb.Table('limajs-users')
    
    update_expr = "SET #role = :role, passengerType = :ptype, walletBalance = :bal, walletCurrency = :curr, createdAt = :now"
    expr_values = {
        ':role': role,
        ':ptype': passenger_type,
        ':bal': Decimal(str(balance)),
        ':curr': 'HTG',
        ':now': datetime.now().isoformat()
    }
    
    if nfc_hash:
        update_expr += ", nfcCardHash = :nfc"
        expr_values[':nfc'] = nfc_hash

    table.update_item(
        Key={'userId': user_id, 'type': 'PROFILE'},
        UpdateExpression=update_expr,
        ExpressionAttributeNames={'#role': 'role'},
        ExpressionAttributeValues=expr_values
    )
    print(f"   💾 Profil DB mis à jour pour {user_id}")

def create_nfc_card(card_uid, user_id=None, balance=0):
    """Crée une carte NFC dans la table limajs-nfc-cards"""
    table = dynamodb.Table('limajs-nfc-cards')
    card_hash = hash_nfc_card(card_uid)
    
    item = {
        'cardId': card_hash,
        'uidHash': card_hash, # redondant mais pratique
        'status': 'active' if user_id else 'inactive',
        'createdAt': datetime.now().isoformat(),
        'balance': Decimal(str(balance)),
        'currency': 'HTG'
    }
    
    if user_id:
        item['userId'] = user_id
        item['activatedAt'] = datetime.now().isoformat()

    try:
        table.put_item(Item=item)
        print(f"   💳 Carte NFC créée: {card_uid} (Hash: {card_hash[:8]}...) - Liée: {'OUI' if user_id else 'NON'}")
        return card_hash
    except Exception as e:
        print(f"   ❌ Erreur création carte NFC: {e}")
        return None

def main():
    print("🚀 Démarrage du Seeding Complet LimaJS...\n")
    
    # Init Cognito
    global USER_POOL_ID
    USER_POOL_ID = get_user_pool_id()
    print(f"🎯 User Pool détecté: {USER_POOL_ID}")
    
    # --- 1. ADMIN ---
    print("\n--- Création Admin ---")
    admin_id = create_cognito_user(
        'admin@limajsmotors.com', 'Admin123!', 'Super', 'Admin', '+50900000000', 'admin', USER_POOL_ID
    )
    if admin_id:
        update_dynamo_profile(admin_id, 'admin', passenger_type='staff', balance=0)

    # --- 2. CHAUFFEUR ---
    print("\n--- Création Chauffeur ---")
    driver_id = create_cognito_user(
        'driver@limajsmotors.com', 'Driver123!', 'Jean', 'Chauffeur', '+50911111111', 'driver', USER_POOL_ID
    )
    if driver_id:
        update_dynamo_profile(driver_id, 'driver', passenger_type='staff', balance=0)
        # Assigner un bus (optionnel)
        
    # --- 3. PASSAGERS (Types Variés) ---
    passengers_config = [
        ('student1@gmail.com', 'Paul', 'Etudiant', 'student', 500),
        ('student2@gmail.com', 'Marie', 'Etul', 'student', 150),
        ('employee1@gmail.com', 'Pierre', 'Employé', 'employee', 2500),
        ('parent1@gmail.com', 'Sophie', 'Maman', 'parent', 1000),
        ('free1@gmail.com', 'Michel', 'Libre', 'free', 0)
    ]

    print("\n--- Création Passagers ---")
    for email, first, last, p_type, balance in passengers_config:
        uid = create_cognito_user(email, 'Pass123!', first, last, '+50922222222', 'passenger', USER_POOL_ID)
        
        if uid:
            # Créer une carte NFC pour chaque passager test
            raw_nfc = f"NFC-{random.randint(10000,99999)}"
            card_hash = create_nfc_card(raw_nfc, user_id=uid, balance=0) # Balance is on user wallet mainly
            
            update_dynamo_profile(uid, 'passenger', passenger_type=p_type, balance=balance, nfc_hash=card_hash)

    # --- 4. CARTES NFC VIERGES (Stock) ---
    print("\n--- Création Cartes NFC Vierges (Stock) ---")
    for i in range(5):
        raw_nfc = f"STOCK-{random.randint(10000,99999)}"
        create_nfc_card(raw_nfc, user_id=None, balance=0)

    print("\n✅ Seeding terminé avec succès !")

if __name__ == '__main__':
    main()

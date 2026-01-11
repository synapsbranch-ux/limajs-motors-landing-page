#!/usr/bin/env python3
"""
Script de seeding pour la base de données LimaJS Motors
Crée des données de test réalistes pour toutes les tables
IMPORTANT: Respecte le schéma DynamoDB avec clés composites (PK + SK)
"""

import boto3
from datetime import datetime, timedelta
from decimal import Decimal

# Configuration
REGION = 'us-east-1'
dynamodb = boto3.resource('dynamodb', region_name=REGION)

# =============================================================================
# DONNÉES DE SEED (avec clés composites correctes)
# =============================================================================

# --- USERS (PK: userId, SK: type) ---
USERS = [
    {
        'userId': 'admin-001',
        'type': 'PROFILE',
        'email': 'admin@limajs.com',
        'firstName': 'Jean',
        'lastName': 'Directeur',
        'phone': '+509 3456 7890',
        'role': 'admin',
        'status': 'active',
        'createdAt': (datetime.now() - timedelta(days=180)).isoformat()
    },
    {
        'userId': 'driver-001',
        'type': 'PROFILE',
        'email': 'pierre.chauffeur@limajs.com',
        'firstName': 'Pierre',
        'lastName': 'Jean-Baptiste',
        'phone': '+509 3111 2222',
        'role': 'driver',
        'status': 'active',
        'licenseNumber': 'DL-2024-001',
        'assignedBusId': 'bus-001',
        'createdAt': (datetime.now() - timedelta(days=120)).isoformat()
    },
    {
        'userId': 'driver-002',
        'type': 'PROFILE',
        'email': 'marie.chauffeur@limajs.com',
        'firstName': 'Marie',
        'lastName': 'Desrosiers',
        'phone': '+509 3222 3333',
        'role': 'driver',
        'status': 'active',
        'licenseNumber': 'DL-2024-002',
        'assignedBusId': 'bus-002',
        'createdAt': (datetime.now() - timedelta(days=90)).isoformat()
    },
    {
        'userId': 'passenger-001',
        'type': 'PROFILE',
        'email': 'client1@gmail.com',
        'firstName': 'Jacques',
        'lastName': 'Bonhomme',
        'phone': '+509 4111 1111',
        'role': 'passenger',
        'status': 'active',
        'createdAt': (datetime.now() - timedelta(days=60)).isoformat()
    },
    {
        'userId': 'passenger-002',
        'type': 'PROFILE',
        'email': 'client2@gmail.com',
        'firstName': 'Sophie',
        'lastName': 'Laurent',
        'phone': '+509 4222 2222',
        'role': 'passenger',
        'status': 'active',
        'createdAt': (datetime.now() - timedelta(days=45)).isoformat()
    },
    {
        'userId': 'passenger-003',
        'type': 'PROFILE',
        'email': 'client3@gmail.com',
        'firstName': 'Marc',
        'lastName': 'Antoine',
        'phone': '+509 4333 3333',
        'role': 'passenger',
        'status': 'active',
        'createdAt': (datetime.now() - timedelta(days=30)).isoformat()
    },
]

# --- BUSES (PK: busId, SK: type) ---
BUSES = [
    {
        'busId': 'bus-001',
        'type': 'INFO',
        'plateNumber': 'AA-1234',
        'model': 'Mercedes Sprinter 519',
        'capacity': 22,
        'status': 'active',
        'year': 2022,
        'currentDriverId': 'driver-001',
        'createdAt': (datetime.now() - timedelta(days=365)).isoformat()
    },
    {
        'busId': 'bus-002',
        'type': 'INFO',
        'plateNumber': 'BB-5678',
        'model': 'Toyota Coaster',
        'capacity': 30,
        'status': 'active',
        'year': 2023,
        'currentDriverId': 'driver-002',
        'createdAt': (datetime.now() - timedelta(days=200)).isoformat()
    },
    {
        'busId': 'bus-003',
        'type': 'INFO',
        'plateNumber': 'CC-9012',
        'model': 'Hyundai County',
        'capacity': 25,
        'status': 'active',
        'year': 2021,
        'createdAt': (datetime.now() - timedelta(days=400)).isoformat()
    },
]

# --- ROUTES (PK: routeId, SK: type) ---
ROUTES = [
    {
        'routeId': 'route-001',
        'type': 'INFO',
        'shortCode': 'A',
        'name': 'Ligne A - Centre-Ville Express',
        'description': 'Liaison rapide centre-ville',
        'color': '#2563EB',
        'status': 'active',
        'stops': [
            {'stopId': 'stop-a1', 'name': 'Gare Centrale', 'lat': Decimal('18.5429'), 'lng': Decimal('-72.3388'), 'order': 1},
            {'stopId': 'stop-a2', 'name': 'Place du Marché', 'lat': Decimal('18.5450'), 'lng': Decimal('-72.3400'), 'order': 2},
            {'stopId': 'stop-a3', 'name': 'Centre Commercial', 'lat': Decimal('18.5480'), 'lng': Decimal('-72.3420'), 'order': 3},
            {'stopId': 'stop-a4', 'name': 'Terminal Nord', 'lat': Decimal('18.5560'), 'lng': Decimal('-72.3480'), 'order': 4},
        ],
        'estimatedDuration': 35,
        'distance': Decimal('8.5'),
        'createdAt': (datetime.now() - timedelta(days=180)).isoformat()
    },
    {
        'routeId': 'route-002',
        'type': 'INFO',
        'shortCode': 'B',
        'name': 'Ligne B - Aéroport Shuttle',
        'description': 'Navette aéroport',
        'color': '#DC2626',
        'status': 'active',
        'stops': [
            {'stopId': 'stop-b1', 'name': 'Gare Centrale', 'lat': Decimal('18.5429'), 'lng': Decimal('-72.3388'), 'order': 1},
            {'stopId': 'stop-b2', 'name': 'Aéroport', 'lat': Decimal('18.5800'), 'lng': Decimal('-72.2900'), 'order': 2},
        ],
        'estimatedDuration': 45,
        'distance': Decimal('15.2'),
        'createdAt': (datetime.now() - timedelta(days=150)).isoformat()
    },
]

# --- SCHEDULES (PK: routeId, SK: scheduleId) ---
SCHEDULES = []
times = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']

for route in ROUTES:
    for i, time in enumerate(times):
        SCHEDULES.append({
            'routeId': route['routeId'],
            'scheduleId': f"sched-{route['routeId'][-3:]}-{i+1:02d}",
            'departureTime': time,
            'daysOfWeek': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'assignedBusId': BUSES[i % len(BUSES)]['busId'],
            'assignedDriverId': USERS[1 + (i % 2)]['userId'],
            'status': 'active',
            'createdAt': datetime.now().isoformat()
        })

# --- SUBSCRIPTIONS (PK: pk, SK: sk) ---
SUBSCRIPTION_TYPES = [
    {
        'pk': 'TYPE',
        'sk': 'daily',
        'name': 'Pass Journalier',
        'price': Decimal('150'),
        'currency': 'HTG',
        'duration': 1,
        'durationType': 'days',
        'status': 'active',
        'endDate': '9999-12-31',
        'createdAt': datetime.now().isoformat()
    },
    {
        'pk': 'TYPE',
        'sk': 'weekly',
        'name': 'Pass Hebdomadaire',
        'price': Decimal('750'),
        'currency': 'HTG',
        'duration': 7,
        'durationType': 'days',
        'status': 'active',
        'endDate': '9999-12-31',
        'createdAt': datetime.now().isoformat()
    },
    {
        'pk': 'TYPE',
        'sk': 'monthly',
        'name': 'Pass Mensuel',
        'price': Decimal('2500'),
        'currency': 'HTG',
        'duration': 30,
        'durationType': 'days',
        'status': 'active',
        'endDate': '9999-12-31',
        'createdAt': datetime.now().isoformat()
    },
]

# --- NFC CARDS (PK: userId, SK: cardId) ---
NFC_CARDS = [
    {
        'userId': 'passenger-001',
        'cardId': 'nfc-001',
        'cardNumber': 'LMJ-2024-0001',
        'nfcUidHash': 'abc123hash',
        'status': 'active',
        'balance': Decimal('500'),
        'expiresAt': (datetime.now() + timedelta(days=365)).isoformat(),
    },
    {
        'userId': 'passenger-002',
        'cardId': 'nfc-002',
        'cardNumber': 'LMJ-2024-0002',
        'nfcUidHash': 'def456hash',
        'status': 'active',
        'balance': Decimal('1200'),
        'expiresAt': (datetime.now() + timedelta(days=300)).isoformat(),
    },
]

# --- TRIPS (PK: tripId, SK: type) ---
TRIPS = [
    {
        'tripId': 'trip-001',
        'type': 'INFO',
        'routeId': 'route-001',
        'busId': 'bus-001',
        'driverId': 'driver-001',
        'status': 'completed',
        'date': datetime.now().strftime('%Y-%m-%d'),
        'startedAt': (datetime.now() - timedelta(hours=5)).isoformat(),
        'endedAt': (datetime.now() - timedelta(hours=4)).isoformat(),
        'passengersBoarded': 18,
        'createdAt': (datetime.now() - timedelta(hours=5)).isoformat()
    },
]

# =============================================================================
# SEEDING
# =============================================================================

def seed_table(table_name, items):
    table = dynamodb.Table(table_name)
    print(f"  📥 Seeding {table_name} ({len(items)} items)...")
    
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)
    
    print(f"     ✅ Done")
    return len(items)

def main():
    print("🌱 LimaJS Motors - Database Seeding")
    print("=" * 50)
    
    total = 0
    total += seed_table('limajs-users', USERS)
    total += seed_table('limajs-buses', BUSES)
    total += seed_table('limajs-routes', ROUTES)
    total += seed_table('limajs-schedules', SCHEDULES)
    total += seed_table('limajs-subscriptions', SUBSCRIPTION_TYPES)
    total += seed_table('limajs-nfc-cards', NFC_CARDS)
    total += seed_table('limajs-trips', TRIPS)
    
    print("=" * 50)
    print(f"🎉 Seeding complete! {total} total items.")

if __name__ == "__main__":
    main()

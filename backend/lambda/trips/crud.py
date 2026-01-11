import json
import os
import sys
import uuid
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import put_item, get_item, update_item, query_items, convert_floats
from boto3.dynamodb.conditions import Key, Attr

TABLE_TRIPS = os.environ.get('TABLE_TRIPS', 'limajs-trips')

def lambda_handler(event, context):
    """
    Handler pour Trips (Voyages).
    Routes:
    - POST /trips/start -> Démarrer un voyage
    - POST /trips/end -> Terminer un voyage
    - POST /trips/board -> Enregistrer embarquement passager
    - POST /trips/alight -> Enregistrer descente passager
    - GET /trips/current/passengers -> Liste passagers du voyage actuel
    """
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    
    try:
        if '/start' in path and http_method == 'POST':
            return start_trip(event)
        elif '/end' in path and http_method == 'POST':
            return end_trip(event)
        elif '/board' in path and http_method == 'POST':
            return board_passenger(event)
        elif '/alight' in path and http_method == 'POST':
            return alight_passenger(event)
        elif '/passengers' in path and http_method == 'GET':
            return get_passengers(event)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def start_trip(event):
    """Démarrer un nouveau voyage."""
    body = json.loads(event.get('body', '{}'))
    
    # Récupérer driver ID
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    driver_sub = claims.get('sub')
    
    if not driver_sub:
        return error(401, "Unauthorized")
    
    required = ['busId', 'routeId', 'scheduleId']
    for field in required:
        if field not in body:
            return error(400, f"Missing required field: {field}")
    
    trip_id = f"TRIP#{str(uuid.uuid4())}"
    
    trip_item = convert_floats({
        'tripId': trip_id,
        'timestamp': datetime.utcnow().isoformat(),
        'busId': body['busId'],
        'routeId': body['routeId'],
        'scheduleId': body['scheduleId'],
        'driverId': f"USER#{driver_sub}",
        'status': 'ACTIVE',  # ACTIVE, COMPLETED
        'startTime': datetime.utcnow().isoformat(),
        'endTime': None,
        'passengerCount': 0,
        'totalRevenue': 0
    })
    
    put_item(TABLE_TRIPS, trip_item)
    
    return success({
        'trip': trip_item
    }, "Trip started successfully")

def end_trip(event):
    """Terminer un voyage."""
    body = json.loads(event.get('body', '{}'))
    
    trip_id = body.get('tripId')
    if not trip_id:
        return error(400, "tripId required")
    
    # Récupérer le voyage
    trips = query_items(TABLE_TRIPS, Key('tripId').eq(trip_id))
    
    if not trips:
        return error(404, "Trip not found")
    
    trip = trips[0]
    
    if trip['status'] != 'ACTIVE':
        return error(400, "Trip is not active")
    
    # Mettre à jour
    updated = update_item(
        TABLE_TRIPS,
        {'tripId': trip_id, 'timestamp': trip['timestamp']},
        "SET #status = :status, endTime = :endTime",
        {
            ':status': 'COMPLETED',
            ':endTime': datetime.utcnow().isoformat()
        },
        {'#status': 'status'}
    )
    
    return success({
        'trip': updated
    }, "Trip ended successfully")

def board_passenger(event):
    """Enregistrer l'embarquement d'un passager."""
    body = json.loads(event.get('body', '{}'))
    
    trip_id = body.get('tripId')
    passenger_id = body.get('passengerId')
    ticket_id = body.get('ticketId')
    
    if not trip_id or not passenger_id:
        return error(400, "tripId and passengerId required")
    
    # Créer l'enregistrement d'embarquement
    boarding_id = str(uuid.uuid4())
    
    boarding_item = convert_floats({
        'tripId': trip_id,
        'boardingId': f"BOARD#{boarding_id}",
        'passengerId': passenger_id,
        'ticketId': ticket_id,
        'boardingTime': datetime.utcnow().isoformat(),
        'stopId': body.get('stopId'),  # Arrêt d'embarquement
        'alightingStopId': None  # Sera rempli au débarquement
    })
    
    put_item(TABLE_TRIPS, boarding_item)
    
    # Incrémenter le compteur de passagers du voyage
    trips = query_items(TABLE_TRIPS, Key('tripId').eq(trip_id))
    if trips:
        trip = trips[0]
        update_item(
            TABLE_TRIPS,
            {'tripId': trip_id, 'timestamp': trip['timestamp']},
            "SET passengerCount = passengerCount + :inc",
            {':inc': 1}
        )
    
    return success({
        'boarding': boarding_item
    }, "Passenger boarded successfully")

def get_passengers(event):
    """Liste des passagers du voyage actuel."""
    query_params = event.get('queryStringParameters') or {}
    trip_id = query_params.get('tripId')
    
    if not trip_id:
        return error(400, "tripId required")
    
    # Query tous les embarquements
    boardings = query_items(
        TABLE_TRIPS,
        Key('tripId').eq(trip_id) & Key('boardingId').begins_with('BOARD#')
    )
    
    # Filtrer pour ne garder que les passagers encore à bord (pas de alightingTime)
    onboard = [b for b in boardings if not b.get('alightingTime')]
    
    return success({
        'passengers': onboard,
        'count': len(onboard),
        'totalBoarded': len(boardings)
    })

def alight_passenger(event):
    """Enregistrer la descente d'un passager."""
    body = json.loads(event.get('body', '{}'))
    
    trip_id = body.get('tripId')
    boarding_id = body.get('boardingId')
    
    if not trip_id or not boarding_id:
        return error(400, "tripId and boardingId required")
    
    # Vérifier que l'enregistrement d'embarquement existe
    boarding = get_item(TABLE_TRIPS, {
        'tripId': trip_id,
        'boardingId': boarding_id
    })
    
    if not boarding:
        return error(404, "Boarding record not found")
    
    if boarding.get('alightingTime'):
        return error(400, "Passenger already alighted")
    
    # Mettre à jour avec l'heure de descente
    updated = update_item(
        TABLE_TRIPS,
        {'tripId': trip_id, 'boardingId': boarding_id},
        "SET alightingTime = :alight, alightingStopId = :stop",
        {
            ':alight': datetime.utcnow().isoformat(),
            ':stop': body.get('stopId')
        }
    )
    
    # Décrémenter le compteur de passagers à bord
    trips = query_items(TABLE_TRIPS, Key('tripId').eq(trip_id))
    if trips:
        trip = trips[0]
        current_count = trip.get('passengerCount', 0)
        if current_count > 0:
            update_item(
                TABLE_TRIPS,
                {'tripId': trip_id, 'timestamp': trip['timestamp']},
                "SET passengerCount = passengerCount - :dec",
                {':dec': 1}
            )
    
    return success({
        'boarding': updated
    }, "Passenger alighted successfully")

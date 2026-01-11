import json
import os
import sys
import boto3
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import put_item, convert_floats

TABLE_GPS = os.environ.get('TABLE_GPS', 'limajs-gps-positions')
LOCATION_TRACKER = os.environ.get('AWS_LOCATION_TRACKER_NAME', 'limajs-bus-tracker')

location = boto3.client('location')

def lambda_handler(event, context):
    """
    Ingère les positions GPS des bus.
    - Reçoit un batch de positions depuis l'app chauffeur
    - Les envoie à Location Tracker (qui trigger EventBridge)
    - Stocke dans DynamoDB pour historique
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        bus_id = body.get('busId')
        positions = body.get('positions', [])
        
        if not bus_id or not positions:
            return error(400, "busId and positions required")
        
        # Récupérer driver ID (pour audit)
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        driver_sub = claims.get('sub')
        
        if not driver_sub:
            return error(401, "Unauthorized")
        
        # Batch update vers Location Tracker
        device_updates = []
        
        for pos in positions:
            device_updates.append({
                'DeviceId': bus_id,
                'SampleTime': pos.get('timestamp', datetime.utcnow().isoformat()),
                'Position': [
                    float(pos['longitude']),
                    float(pos['latitude'])
                ]
            })
        
        # Envoyer à Location Tracker
        try:
            location.batch_update_device_position(
                TrackerName=LOCATION_TRACKER,
                Updates=device_updates
            )
            print(f"✅ {len(device_updates)} positions envoyées au tracker")
        except Exception as e:
            print(f"⚠️ Erreur Location Tracker: {e}")
            # Continue quand même pour sauver dans DynamoDB
        
        # Sauvegarder la dernière position dans DynamoDB
        latest_pos = positions[-1]
        ttl = int(datetime.utcnow().timestamp()) + 86400  # 24h TTL
        
        gps_item = convert_floats({
            'busId': bus_id,
            'timestamp': latest_pos.get('timestamp', datetime.utcnow().isoformat()),
            'latitude': latest_pos['latitude'],
            'longitude': latest_pos['longitude'],
            'speed': latest_pos.get('speed', 0),
            'heading': latest_pos.get('heading', 0),
            'accuracy': latest_pos.get('accuracy', 10),
            'routeId': body.get('routeId'),
            'driverId': f"USER#{driver_sub}",
            'ttl': ttl
        })
        
        put_item(TABLE_GPS, gps_item)
        
        return success({
            'processed': len(positions),
            'latestPosition': gps_item
        }, "GPS positions ingested successfully")
        
    except Exception as e:
        print(f"❌ Erreur GPS ingest: {e}")
        return error(500, str(e))

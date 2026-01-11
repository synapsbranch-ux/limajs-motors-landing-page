import json
import os
import sys
import uuid
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error, get_http_method, get_path_parameters
from shared.db import put_item, get_item, query_items, scan_items, delete_item, convert_floats
from boto3.dynamodb.conditions import Key, Attr

TABLE_SCHEDULES = os.environ.get('TABLE_SCHEDULES', 'limajs-schedules')

def lambda_handler(event, context):
    """
    Handler CRUD pour Schedules (Horaires).
    Routes:
    - POST /schedules -> Créer un horaire
    - GET /schedules?routeId={id} -> Lister horaires d'une ligne
    - GET /schedules/{scheduleId} -> Récupérer un horaire
    - PUT /schedules/{scheduleId} -> Modifier un horaire
    - DELETE /schedules/{scheduleId} -> Supprimer un horaire
    """
    http_method = get_http_method(event)
    path_parameters = get_path_parameters(event)
    query_parameters = event.get('queryStringParameters') or {}
    schedule_id = path_parameters.get('scheduleId') or path_parameters.get('id')
    
    try:
        if http_method == 'POST':
            return create_schedule(event)
        elif http_method == 'GET' and schedule_id:
            return get_schedule(schedule_id)
        elif http_method == 'GET':
            return list_schedules(query_parameters)
        elif http_method == 'PUT' and schedule_id:
            return update_schedule(schedule_id, event)
        elif http_method == 'DELETE' and schedule_id:
            return delete_schedule(schedule_id)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def create_schedule(event):
    """Créer un nouvel horaire."""
    body = json.loads(event.get('body', '{}'))
    
    required = ['routeId', 'departureTime', 'days']
    for field in required:
        if field not in body:
            return error(400, f"Missing required field: {field}")
    
    schedule_id = f"SCHEDULE#{str(uuid.uuid4())}"
    
    schedule_item = convert_floats({
        'scheduleId': schedule_id,
        'type': 'DEPARTURE',
        'routeId': body['routeId'],
        'departureTime': body['departureTime'],  # Format HH:MM
        'days': body['days'],  # Liste: ["MON", "TUE", "WED", ...]
        'busId': body.get('busId'),  # Optionnel
        'driverId': body.get('driverId'),  # Optionnel
        'isActive': body.get('isActive', True),
        'createdAt': datetime.utcnow().isoformat(),
        'updatedAt': datetime.utcnow().isoformat()
    })
    
    put_item(TABLE_SCHEDULES, schedule_item)
    
    return success({'schedule': schedule_item}, "Schedule created successfully")

def get_schedule(schedule_id):
    """Récupérer un horaire."""
    schedule = get_item(TABLE_SCHEDULES, {
        'scheduleId': schedule_id,
        'type': 'DEPARTURE'
    })
    
    if not schedule:
        return error(404, "Schedule not found")
    
    return success({'schedule': schedule})

def list_schedules(query_params):
    """Lister les horaires (filtrable par routeId)."""
    route_id = query_params.get('routeId')
    
    if route_id:
        # Query avec GSI route-schedules-index
        schedules = query_items(
            TABLE_SCHEDULES,
            Key('routeId').eq(route_id) & Key('type').eq('DEPARTURE'),
            index_name='route-schedules-index'
        )
    else:
        schedules = scan_items(TABLE_SCHEDULES, Attr('type').eq('DEPARTURE'))
    
    return success({'schedules': schedules, 'count': len(schedules)})

def update_schedule(schedule_id, event):
    """Mettre à jour un horaire."""
    body = json.loads(event.get('body', '{}'))
    
    existing = get_item(TABLE_SCHEDULES, {'scheduleId': schedule_id, 'type': 'DEPARTURE'})
    if not existing:
        return error(404, "Schedule not found")
    
    update_expr = "SET updatedAt = :updated"
    expr_values = {':updated': datetime.utcnow().isoformat()}
    
    allowed = ['departureTime', 'days', 'busId', 'driverId', 'isActive']
    
    for field in allowed:
        if field in body:
            update_expr += f", {field} = :{field}"
            expr_values[f":{field}"] = body[field]
    
    from shared.db import update_item
    updated = update_item(
        TABLE_SCHEDULES,
        {'scheduleId': schedule_id, 'type': 'DEPARTURE'},
        update_expr,
        convert_floats(expr_values)
    )
    
    return success({'schedule': updated}, "Schedule updated successfully")

def delete_schedule(schedule_id):
    """Désactiver un horaire."""
    existing = get_item(TABLE_SCHEDULES, {'scheduleId': schedule_id, 'type': 'DEPARTURE'})
    if not existing:
        return error(404, "Schedule not found")
    
    from shared.db import update_item
    updated = update_item(
        TABLE_SCHEDULES,
        {'scheduleId': schedule_id, 'type': 'DEPARTURE'},
        "SET isActive = :active, updatedAt = :updated",
        {':active': False, ':updated': datetime.utcnow().isoformat()}
    )
    
    return success({'schedule': updated}, "Schedule deactivated successfully")

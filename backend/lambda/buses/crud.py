import json
import os
import sys
import uuid
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error, get_http_method, get_path_parameters
from shared.db import put_item, get_item, scan_items, delete_item, update_item, convert_floats
from boto3.dynamodb.conditions import Key, Attr

TABLE_BUSES = os.environ.get('TABLE_BUSES', 'limajs-buses')

def lambda_handler(event, context):
    """
    Handler principal pour CRUD des Bus.
    Routes:
    - POST /buses -> Créer un bus
    - GET /buses -> Lister tous les bus
    - GET /buses/{busId} -> Récupérer un bus
    - PUT /buses/{busId} -> Modifier un bus
    - DELETE /buses/{busId} -> Supprimer un bus
    """
    http_method = get_http_method(event)
    path_parameters = get_path_parameters(event)
    bus_id = path_parameters.get('busId') or path_parameters.get('id')
    
    try:
        if http_method == 'POST':
            return create_bus(event)
        elif http_method == 'GET' and bus_id:
            return get_bus(bus_id)
        elif http_method == 'GET':
            return list_buses(event)
        elif http_method == 'PUT' and bus_id:
            return update_bus(bus_id, event)
        elif http_method == 'DELETE' and bus_id:
            return delete_bus(bus_id)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def create_bus(event):
    """Créer un nouveau bus."""
    body = json.loads(event.get('body', '{}'))
    
    # Validation
    required_fields = ['plateNumber', 'model', 'capacity']
    for field in required_fields:
        if field not in body:
            return error(400, f"Missing required field: {field}")
    
    bus_id = f"BUS#{str(uuid.uuid4())}"
    
    bus_item = convert_floats({
        'busId': bus_id,
        'type': 'INFO',
        'plateNumber': body['plateNumber'],
        'model': body['model'],
        'manufacturer': body.get('manufacturer', ''),
        'year': body.get('year', 0),
        'capacity': body['capacity'],
        'status': body.get('status', 'ACTIVE'),  # ACTIVE, MAINTENANCE, RETIRED
        'fuelType': body.get('fuelType', 'DIESEL'),
        'currentMileage': body.get('currentMileage', 0),
        'createdAt': datetime.utcnow().isoformat(),
        'updatedAt': datetime.utcnow().isoformat()
    })
    
    put_item(TABLE_BUSES, bus_item)
    
    return success({'bus': bus_item}, "Bus created successfully")

def get_bus(bus_id):
    """Récupérer un bus par ID."""
    bus = get_item(TABLE_BUSES, {
        'busId': bus_id,
        'type': 'INFO'
    })
    
    if not bus:
        return error(404, "Bus not found")
    
    return success({'bus': bus})

def list_buses(event):
    """Lister tous les bus (avec filtres optionnels)."""
    query_params = event.get('queryStringParameters') or {}
    status_filter = query_params.get('status')
    
    # Scan (à optimiser avec GSI si nécessaire)
    if status_filter:
        buses = scan_items(TABLE_BUSES, Attr('status').eq(status_filter) & Attr('type').eq('INFO'))
    else:
        buses = scan_items(TABLE_BUSES, Attr('type').eq('INFO'))
    
    return success({'buses': buses, 'count': len(buses)})

def update_bus(bus_id, event):
    """Mettre à jour un bus."""
    body = json.loads(event.get('body', '{}'))
    
    # Vérifier existence
    existing = get_item(TABLE_BUSES, {'busId': bus_id, 'type': 'INFO'})
    if not existing:
        return error(404, "Bus not found")
    
    # Construire l'expression de mise à jour
    update_expr = "SET updatedAt = :updated"
    expr_values = {':updated': datetime.utcnow().isoformat()}
    
    allowed_updates = ['model', 'manufacturer', 'year', 'capacity', 'status', 'fuelType', 'currentMileage']
    
    for field in allowed_updates:
        if field in body:
            update_expr += f", {field} = :{field}"
            expr_values[f":{field}"] = body[field]
    
    updated_bus = update_item(
        TABLE_BUSES,
        {'busId': bus_id, 'type': 'INFO'},
        update_expr,
        convert_floats(expr_values)
    )
    
    return success({'bus': updated_bus}, "Bus updated successfully")

def delete_bus(bus_id):
    """Supprimer un bus (soft delete - changer status à RETIRED)."""
    existing = get_item(TABLE_BUSES, {'busId': bus_id, 'type': 'INFO'})
    if not existing:
        return error(404, "Bus not found")
    
    # Soft delete
    updated = update_item(
        TABLE_BUSES,
        {'busId': bus_id, 'type': 'INFO'},
        "SET #status = :status, updatedAt = :updated",
        {':status': 'RETIRED', ':updated': datetime.utcnow().isoformat()},
        {'#status': 'status'}
    )
    
    return success({'bus': updated}, "Bus retired successfully")

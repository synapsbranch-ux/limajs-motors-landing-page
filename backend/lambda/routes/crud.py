import json
import os
import sys
import uuid
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error, get_http_method, get_path_parameters
from shared.db import put_item, get_item, scan_items, delete_item, update_item, convert_floats, query_items
from boto3.dynamodb.conditions import Key, Attr

TABLE_ROUTES = os.environ.get('TABLE_ROUTES', 'limajs-routes')

def lambda_handler(event, context):
    """
    Handler CRUD pour Routes (Lignes de transport).
    Routes:
    - POST /routes -> Créer une ligne
    - GET /routes -> Lister toutes les lignes
    - GET /routes/{routeId} -> Récupérer une ligne
    - PUT /routes/{routeId} -> Modifier une ligne
    - DELETE /routes/{routeId} -> Supprimer une ligne
    """
    http_method = get_http_method(event)
    path_parameters = get_path_parameters(event)
    route_id = path_parameters.get('routeId') or path_parameters.get('id')
    
    try:
        if http_method == 'POST':
            return create_route(event)
        elif http_method == 'GET' and route_id:
            return get_route(route_id)
        elif http_method == 'GET':
            return list_routes()
        elif http_method == 'PUT' and route_id:
            return update_route(route_id, event)
        elif http_method == 'DELETE' and route_id:
            return delete_route(route_id)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def create_route(event):
    """Créer une nouvelle ligne de transport."""
    body = json.loads(event.get('body', '{}'))
    
    # Validation
    required = ['name', 'code', 'stops']
    for field in required:
        if field not in body:
            return error(400, f"Missing required field: {field}")
    
    route_id = f"ROUTE#{str(uuid.uuid4())}"
    
    route_item = convert_floats({
        'routeId': route_id,
        'stopIndex': 'METADATA',
        'name': body['name'],
        'code': body['code'],  # Ex: "L1", "L2"
        'description': body.get('description', ''),
        'isActive': body.get('isActive', True),
        'color': body.get('color', '#3B82F6'),  # Couleur pour l'UI
        'price': body.get('price', 0),
        'estimatedDuration': body.get('estimatedDuration', 0),  # minutes
        'totalDistance': body.get('totalDistance', 0),  # km
        'createdAt': datetime.utcnow().isoformat(),
        'updatedAt': datetime.utcnow().isoformat()
    })
    
    put_item(TABLE_ROUTES, route_item)
    
    # Ajouter les arrêts
    stops = body['stops']
    for idx, stop in enumerate(stops):
        stop_item = convert_floats({
            'routeId': route_id,
            'stopIndex': f"STOP#{idx:03d}",  # STOP#000, STOP#001, etc.
            'name': stop['name'],
            'latitude': stop['latitude'],
            'longitude': stop['longitude'],
            'order': idx,
            'estimatedTime': stop.get('estimatedTime', 0)  # minutes depuis départ
        })
        put_item(TABLE_ROUTES, stop_item)
    
    return success({'route': route_item, 'stopsCount': len(stops)}, "Route created successfully")

def get_route(route_id):
    """Récupérer une ligne avec ses arrêts."""
    # Metadata de la route
    route = get_item(TABLE_ROUTES, {
        'routeId': route_id,
        'stopIndex': 'METADATA'
    })
    
    if not route:
        return error(404, "Route not found")
    
    # Récupérer tous les arrêts
    stops = query_items(
        TABLE_ROUTES,
        Key('routeId').eq(route_id) & Key('stopIndex').begins_with('STOP#')
    )
    
    # Trier par ordre
    stops_sorted = sorted(stops, key=lambda x: x['order'])
    
    return success({
        'route': route,
        'stops': stops_sorted
    })

def list_routes():
    """Lister toutes les lignes (sans les arrêts)."""
    routes = scan_items(TABLE_ROUTES, Attr('stopIndex').eq('METADATA'))
    return success({'routes': routes, 'count': len(routes)})

def update_route(route_id, event):
    """Mettre à jour une ligne."""
    body = json.loads(event.get('body', '{}'))
    
    existing = get_item(TABLE_ROUTES, {'routeId': route_id, 'stopIndex': 'METADATA'})
    if not existing:
        return error(404, "Route not found")
    
    update_expr = "SET updatedAt = :updated"
    expr_values = {':updated': datetime.utcnow().isoformat()}
    
    allowed = ['name', 'description', 'isActive', 'color', 'price', 'estimatedDuration', 'totalDistance']
    
    for field in allowed:
        if field in body:
            update_expr += f", {field} = :{field}"
            expr_values[f":{field}"] = body[field]
    
    updated = update_item(
        TABLE_ROUTES,
        {'routeId': route_id, 'stopIndex': 'METADATA'},
        update_expr,
        convert_floats(expr_values)
    )
    
    return success({'route': updated}, "Route updated successfully")

def delete_route(route_id):
    """Désactiver une ligne (soft delete)."""
    existing = get_item(TABLE_ROUTES, {'routeId': route_id, 'stopIndex': 'METADATA'})
    if not existing:
        return error(404, "Route not found")
    
    updated = update_item(
        TABLE_ROUTES,
        {'routeId': route_id, 'stopIndex': 'METADATA'},
        "SET isActive = :active, updatedAt = :updated",
        {':active': False, ':updated': datetime.utcnow().isoformat()}
    )
    
    return success({'route': updated}, "Route deactivated successfully")

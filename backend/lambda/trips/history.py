"""
Historique des trajets pour les passagers
"""

import json
from datetime import datetime

import sys
sys.path.insert(0, '/var/task')
from shared.db import get_table
from shared.response import success, error


def get_trip_history(event, context):
    """GET /trips/history - Historique des trajets du passager"""
    user_id = event.get('requestContext', {}).get('authorizer', {}).get('claims', {}).get('sub')
    
    if not user_id:
        return error(401, 'Unauthorized')
    
    params = event.get('queryStringParameters') or {}
    limit = int(params.get('limit', 20))
    start_date = params.get('startDate')
    end_date = params.get('endDate')
    
    # Query passenger trip records
    table = get_table('limajs-passenger-trips')
    
    query_params = {
        'KeyConditionExpression': 'passengerId = :pid',
        'ExpressionAttributeValues': {':pid': user_id},
        'ScanIndexForward': False,  # Most recent first
        'Limit': limit
    }
    
    # Add date filter if provided
    if start_date and end_date:
        query_params['FilterExpression'] = '#date BETWEEN :start AND :end'
        query_params['ExpressionAttributeNames'] = {'#date': 'date'}
        query_params['ExpressionAttributeValues'][':start'] = start_date
        query_params['ExpressionAttributeValues'][':end'] = end_date
    
    response = table.query(**query_params)
    
    # Get route names
    routes_table = get_table('limajs-routes')
    route_cache = {}
    
    trips = []
    for item in response.get('Items', []):
        route_id = item.get('routeId')
        
        # Get route name (with caching)
        if route_id and route_id not in route_cache:
            route_resp = routes_table.get_item(Key={'routeId': route_id, 'type': 'INFO'})
            route_cache[route_id] = route_resp.get('Item', {}).get('name', 'Route inconnue')
        
        trips.append({
            'tripId': item.get('tripId'),
            'date': item.get('date'),
            'routeId': route_id,
            'routeName': route_cache.get(route_id, 'Route inconnue'),
            'boardedAt': item.get('boardedAt'),
            'boardedStop': item.get('boardedStopName'),
            'alightedAt': item.get('alightedAt'),
            'alightedStop': item.get('alightedStopName'),
            'fare': float(item.get('fare', 0)),
            'paymentMethod': item.get('paymentMethod', 'subscription')
        })
    
    return success({
        'trips': trips,
        'count': len(trips)
    })


def handler(event, context):
    """Main handler"""
    return get_trip_history(event, context)

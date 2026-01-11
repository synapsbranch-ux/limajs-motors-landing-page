import json
import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import scan_items, query_items, convert_floats
from boto3.dynamodb.conditions import Key, Attr

# Tables
TABLE_PAYMENTS = os.environ.get('TABLE_PAYMENTS', 'limajs-payments')
TABLE_SUBSCRIPTIONS = os.environ.get('TABLE_SUBSCRIPTIONS', 'limajs-subscriptions')
TABLE_TRIPS = os.environ.get('TABLE_TRIPS', 'limajs-trips')
TABLE_USERS = os.environ.get('TABLE_USERS', 'limajs-users')

def lambda_handler(event, context):
    """
    Handler pour rapports financiers admin.
    Routes:
    - GET /admin/reports/dashboard -> KPIs principaux
    - GET /admin/reports/revenue -> Revenus par période
    - GET /admin/reports/subscriptions -> Stats abonnements
    - GET /admin/reports/trips -> Stats voyages
    """
    path = event.get('rawPath') or event.get('path', '')
    query_parameters = event.get('queryStringParameters') or {}
    
    try:
        if '/dashboard' in path:
            return get_dashboard_kpis()
        elif '/revenue' in path:
            return get_revenue_report(query_parameters)
        elif '/subscriptions' in path:
            return get_subscriptions_report(query_parameters)
        elif '/trips' in path:
            return get_trips_report(query_parameters)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def get_dashboard_kpis():
    """KPIs principaux du tableau de bord."""
    today = datetime.utcnow().date().isoformat()
    month_start = datetime.utcnow().replace(day=1).date().isoformat()
    
    # Paiements approuvés ce mois
    all_payments = scan_items(TABLE_PAYMENTS, Attr('status').eq('APPROVED'))
    monthly_payments = [p for p in all_payments if p.get('approvedAt', '').startswith(month_start[:7])]
    monthly_revenue = sum(float(p.get('amount', 0)) for p in monthly_payments)
    
    # Paiements en attente
    pending_payments = scan_items(TABLE_PAYMENTS, Attr('status').eq('PENDING'))
    pending_amount = sum(float(p.get('amount', 0)) for p in pending_payments)
    
    # Abonnements actifs
    active_subs = scan_items(TABLE_SUBSCRIPTIONS, Attr('status').eq('ACTIVE'))
    
    # Voyages aujourd'hui
    all_trips = scan_items(TABLE_TRIPS, Attr('timestamp').exists())
    trips_today = [t for t in all_trips if t.get('startTime', '').startswith(today)]
    
    # Passagers aujourd'hui (somme des passengerCount)
    passengers_today = sum(int(t.get('passengerCount', 0)) for t in trips_today)
    
    return success({
        'kpis': {
            'monthlyRevenue': {
                'value': monthly_revenue,
                'currency': 'HTG',
                'label': 'Revenus du mois'
            },
            'pendingPayments': {
                'value': len(pending_payments),
                'amount': pending_amount,
                'label': 'Paiements en attente'
            },
            'activeSubscriptions': {
                'value': len(active_subs),
                'label': 'Abonnements actifs'
            },
            'tripsToday': {
                'value': len(trips_today),
                'label': 'Voyages aujourd\'hui'
            },
            'passengersToday': {
                'value': passengers_today,
                'label': 'Passagers aujourd\'hui'
            }
        },
        'generatedAt': datetime.utcnow().isoformat()
    })

def get_revenue_report(params):
    """Rapport de revenus par période."""
    period = params.get('period', 'month')  # day, week, month, year
    
    # Récupérer tous les paiements approuvés
    payments = scan_items(TABLE_PAYMENTS, Attr('status').eq('APPROVED'))
    
    # Grouper par période
    revenue_by_period = {}
    
    for payment in payments:
        approved_at = payment.get('approvedAt', payment.get('createdAt', ''))
        if not approved_at:
            continue
            
        # Extraire la clé de période
        if period == 'day':
            key = approved_at[:10]  # YYYY-MM-DD
        elif period == 'week':
            date = datetime.fromisoformat(approved_at.replace('Z', '+00:00'))
            key = f"{date.year}-W{date.isocalendar()[1]:02d}"
        elif period == 'month':
            key = approved_at[:7]  # YYYY-MM
        else:  # year
            key = approved_at[:4]  # YYYY
        
        if key not in revenue_by_period:
            revenue_by_period[key] = {'total': 0, 'count': 0, 'byType': {}}
        
        amount = float(payment.get('amount', 0))
        sub_type = payment.get('subscriptionType', 'UNKNOWN')
        
        revenue_by_period[key]['total'] += amount
        revenue_by_period[key]['count'] += 1
        revenue_by_period[key]['byType'][sub_type] = revenue_by_period[key]['byType'].get(sub_type, 0) + amount
    
    # Convertir en liste triée
    report = [
        {'period': k, **v}
        for k, v in sorted(revenue_by_period.items(), reverse=True)
    ]
    
    total_revenue = sum(float(p.get('amount', 0)) for p in payments)
    
    return success({
        'report': report[:12],  # 12 dernières périodes
        'summary': {
            'totalRevenue': total_revenue,
            'totalTransactions': len(payments),
            'averageTransaction': total_revenue / len(payments) if payments else 0
        }
    })

def get_subscriptions_report(params):
    """Rapport sur les abonnements."""
    all_subs = scan_items(TABLE_SUBSCRIPTIONS)
    
    # Stats par statut
    by_status = {}
    for sub in all_subs:
        status = sub.get('status', 'UNKNOWN')
        if status not in by_status:
            by_status[status] = 0
        by_status[status] += 1
    
    # Stats par type
    by_type = {}
    for sub in all_subs:
        sub_type = sub.get('type', 'UNKNOWN')
        if sub_type not in by_type:
            by_type[sub_type] = 0
        by_type[sub_type] += 1
    
    # Taux de renouvellement (simplificé)
    active = by_status.get('ACTIVE', 0)
    expired = by_status.get('EXPIRED', 0)
    renewal_rate = (active / (active + expired) * 100) if (active + expired) > 0 else 0
    
    return success({
        'byStatus': by_status,
        'byType': by_type,
        'metrics': {
            'total': len(all_subs),
            'active': active,
            'renewalRate': round(renewal_rate, 2)
        }
    })

def get_trips_report(params):
    """Rapport sur les voyages."""
    period = params.get('period', 'today')
    
    all_trips = scan_items(TABLE_TRIPS, Attr('timestamp').exists())
    
    # Filtrer par période
    now = datetime.utcnow()
    if period == 'today':
        filter_date = now.date().isoformat()
        trips = [t for t in all_trips if t.get('startTime', '').startswith(filter_date)]
    elif period == 'week':
        week_ago = (now - timedelta(days=7)).isoformat()
        trips = [t for t in all_trips if t.get('startTime', '') >= week_ago]
    elif period == 'month':
        month_start = now.replace(day=1).isoformat()
        trips = [t for t in all_trips if t.get('startTime', '') >= month_start]
    else:
        trips = all_trips
    
    # Stats
    total_passengers = sum(int(t.get('passengerCount', 0)) for t in trips)
    completed = len([t for t in trips if t.get('status') == 'COMPLETED'])
    active = len([t for t in trips if t.get('status') == 'ACTIVE'])
    
    # Par route
    by_route = {}
    for trip in trips:
        route_id = trip.get('routeId', 'UNKNOWN')
        if route_id not in by_route:
            by_route[route_id] = {'trips': 0, 'passengers': 0}
        by_route[route_id]['trips'] += 1
        by_route[route_id]['passengers'] += int(trip.get('passengerCount', 0))
    
    return success({
        'period': period,
        'summary': {
            'totalTrips': len(trips),
            'completed': completed,
            'active': active,
            'totalPassengers': total_passengers,
            'avgPassengersPerTrip': round(total_passengers / len(trips), 2) if trips else 0
        },
        'byRoute': by_route
    })

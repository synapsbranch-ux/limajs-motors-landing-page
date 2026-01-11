import json
import os
import sys
import boto3
import requests
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error
from shared.db import get_item, put_item, query_items, scan_items, update_item, convert_floats
from shared.secrets import get_secret
from boto3.dynamodb.conditions import Key, Attr

TABLE_USERS = os.environ.get('TABLE_USERS', 'limajs-users')
TABLE_NOTIFICATIONS = os.environ.get('TABLE_NOTIFICATIONS', 'limajs-notifications')

def lambda_handler(event, context):
    """
    Handler pour notifications push.
    Routes:
    - POST /notifications/register -> Enregistrer device token (FCM)
    - POST /notifications/send -> Envoyer notification (admin)
    - POST /notifications/broadcast -> Broadcast à tous (admin)
    - GET /notifications/history -> Historique notifications
    """
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    
    try:
        if '/register' in path and http_method == 'POST':
            return register_device(event)
        elif '/send' in path and http_method == 'POST':
            return send_notification(event)
        elif '/broadcast' in path and http_method == 'POST':
            return broadcast_notification(event)
        elif '/history' in path and http_method == 'GET':
            return get_notification_history(event)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def register_device(event):
    """Enregistrer un device token pour les push notifications."""
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_sub = claims.get('sub')
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    user_id = f"USER#{user_sub}"
    body = json.loads(event.get('body', '{}'))
    
    device_token = body.get('deviceToken')
    platform = body.get('platform', 'android')  # android, ios, web
    
    if not device_token:
        return error(400, "deviceToken required")
    
    # Mettre à jour le profil avec le token
    updated = update_item(
        TABLE_USERS,
        {'userId': user_id, 'type': 'PROFILE'},
        "SET fcmToken = :token, fcmPlatform = :platform, tokenUpdatedAt = :updated",
        {
            ':token': device_token,
            ':platform': platform,
            ':updated': datetime.utcnow().isoformat()
        }
    )
    
    return success({
        'registered': True,
        'platform': platform
    }, "Device registered for push notifications")

def send_push_to_device(token, title, body, data=None):
    """Envoyer une notification push via Firebase Cloud Messaging."""
    try:
        # Récupérer la clé FCM depuis Secrets Manager
        secret_name = os.environ.get('SECRET_NAME', 'limajs/backend/production')
        secrets = get_secret(secret_name)
        
        # Gestion cas string vs dict
        fcm_key = secrets.get('FCM_SERVER_KEY') if isinstance(secrets, dict) else secrets
        
        if not fcm_key:
            print("⚠️ FCM_SERVER_KEY not configured")
            return False
        
        headers = {
            'Authorization': f'key={fcm_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'to': token,
            'notification': {
                'title': title,
                'body': body
            },
            'data': data or {}
        }
        
        response = requests.post(
            'https://fcm.googleapis.com/fcm/send',
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('success', 0) > 0
        else:
            print(f"FCM Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error sending push: {e}")
        return False

def send_notification(event):
    """Envoyer une notification à un utilisateur spécifique."""
    body = json.loads(event.get('body', '{}'))
    
    target_user_id = body.get('userId')
    title = body.get('title')
    message = body.get('message')
    notification_type = body.get('type', 'INFO')  # INFO, ALERT, PROMO, PAYMENT
    
    if not target_user_id or not title or not message:
        return error(400, "userId, title and message required")
    
    # Récupérer le token FCM de l'utilisateur
    user = get_item(TABLE_USERS, {'userId': target_user_id, 'type': 'PROFILE'})
    
    if not user:
        return error(404, "User not found")
    
    fcm_token = user.get('fcmToken')
    
    # Sauvegarder la notification dans l'historique
    notification_id = f"NOTIF#{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    notification_item = convert_floats({
        'userId': target_user_id,
        'notificationId': notification_id,
        'title': title,
        'message': message,
        'type': notification_type,
        'read': False,
        'sentAt': datetime.utcnow().isoformat(),
        'delivered': False
    })
    
    # Envoyer la push notification si token disponible
    if fcm_token:
        delivered = send_push_to_device(
            fcm_token,
            title,
            message,
            {'type': notification_type, 'notificationId': notification_id}
        )
        notification_item['delivered'] = delivered
    
    put_item(TABLE_NOTIFICATIONS, notification_item)
    
    return success({
        'notification': notification_item
    }, "Notification sent")

def broadcast_notification(event):
    """Envoyer une notification à tous les utilisateurs."""
    body = json.loads(event.get('body', '{}'))
    
    title = body.get('title')
    message = body.get('message')
    notification_type = body.get('type', 'PROMO')
    role_filter = body.get('role')  # Optionnel: PASSENGER, DRIVER
    
    if not title or not message:
        return error(400, "title and message required")
    
    # Récupérer tous les users avec un FCM token
    all_users = scan_items(TABLE_USERS, Attr('fcmToken').exists() & Attr('type').eq('PROFILE'))
    
    if role_filter:
        all_users = [u for u in all_users if u.get('role') == role_filter]
    
    sent_count = 0
    failed_count = 0
    
    for user in all_users:
        fcm_token = user.get('fcmToken')
        if fcm_token:
            if send_push_to_device(fcm_token, title, message, {'type': notification_type}):
                sent_count += 1
            else:
                failed_count += 1
    
    # Sauvegarder le broadcast dans l'historique admin
    broadcast_id = f"BROADCAST#{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    broadcast_item = convert_floats({
        'userId': 'SYSTEM',
        'notificationId': broadcast_id,
        'title': title,
        'message': message,
        'type': notification_type,
        'targetRole': role_filter,
        'sentTo': sent_count + failed_count,
        'delivered': sent_count,
        'failed': failed_count,
        'sentAt': datetime.utcnow().isoformat()
    })
    
    put_item(TABLE_NOTIFICATIONS, broadcast_item)
    
    return success({
        'broadcast': broadcast_item
    }, f"Broadcast sent to {sent_count} users")

def get_notification_history(event):
    """Historique des notifications d'un utilisateur."""
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_sub = claims.get('sub')
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    user_id = f"USER#{user_sub}"
    
    # Query notifications de l'utilisateur
    notifications = query_items(
        TABLE_NOTIFICATIONS,
        Key('userId').eq(user_id)
    )
    
    # Trier par date (plus récent en premier)
    notifications_sorted = sorted(
        notifications,
        key=lambda x: x.get('sentAt', ''),
        reverse=True
    )
    
    unread_count = len([n for n in notifications if not n.get('read', True)])
    
    return success({
        'notifications': notifications_sorted[:50],  # 50 dernières
        'unreadCount': unread_count
    })

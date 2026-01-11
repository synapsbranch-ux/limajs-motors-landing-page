import json
import os
import sys
import boto3
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from shared.response import success, error, get_http_method, get_user_sub
from shared.db import get_item, update_item, convert_floats

TABLE_USERS = os.environ.get('TABLE_USERS', 'limajs-users')
S3_BUCKET = os.environ.get('AWS_S3_BUCKET_NAME')

s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Handler pour mise à jour du profil utilisateur.
    Routes:
    - PUT /users/me -> Modifier mon profil
    - POST /users/me/photo -> Upload photo de profil (presigned URL)
    """
    - POST /users/me/photo -> Upload photo de profil (presigned URL)
    """
    http_method = get_http_method(event)
    path = event.get('rawPath') or event.get('path', '')
    
    try:
        if '/photo' in path and http_method == 'POST':
            return get_photo_upload_url(event)
        elif http_method == 'PUT':
            return update_profile(event)
        else:
            return error(400, "Invalid request")
    except Exception as e:
        print(f"Error: {e}")
        return error(500, str(e))

def update_profile(event):
    """Mettre à jour les informations de profil."""
    # Récupérer userId depuis JWT
    user_sub = get_user_sub(event)
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    user_id = f"USER#{user_sub}"
    
    # Vérifier que l'utilisateur existe
    existing = get_item(TABLE_USERS, {'userId': user_id, 'type': 'PROFILE'})
    if not existing:
        return error(404, "User profile not found")
    
    body = json.loads(event.get('body', '{}'))
    
    # Champs modifiables
    allowed_fields = ['name', 'phone', 'address', 'emergencyContact', 'preferredLanguage', 'photoUrl']
    
    update_expr = "SET updatedAt = :updated"
    expr_values = {':updated': datetime.utcnow().isoformat()}
    expr_names = {}
    
    for field in allowed_fields:
        if field in body:
            # Gérer les mots réservés DynamoDB
            safe_field = f"#{field}" if field in ['name'] else field
            if field in ['name']:
                expr_names[f"#{field}"] = field
            update_expr += f", {safe_field} = :{field}"
            expr_values[f":{field}"] = body[field]
    
    if len(expr_values) == 1:
        return error(400, "No valid fields to update")
    
    updated = update_item(
        TABLE_USERS,
        {'userId': user_id, 'type': 'PROFILE'},
        update_expr,
        convert_floats(expr_values),
        expr_names if expr_names else None
    )
    
    return success({'profile': updated}, "Profile updated successfully")

def get_photo_upload_url(event):
    """Générer une URL pré-signée pour upload photo de profil."""
    user_sub = get_user_sub(event)
    
    if not user_sub:
        return error(401, "Unauthorized")
    
    body = json.loads(event.get('body', '{}'))
    file_type = body.get('fileType', 'image/jpeg')
    
    # Générer clé S3 unique
    s3_key = f"profile-photos/{user_sub}/avatar.jpg"
    
    try:
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': s3_key,
                'ContentType': file_type
            },
            ExpiresIn=900  # 15 minutes
        )
        
        # URL publique de la photo (après upload)
        photo_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"
        
        return success({
            'uploadUrl': presigned_url,
            'photoUrl': photo_url
        }, "Upload URL generated")
        
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return error(500, str(e))

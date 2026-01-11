import json

def api_response(status_code, body):
    """
    Génère une réponse formatée pour API Gateway Proxy Integration.
    Inclut les headers CORS par défaut.
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", # À restreindre en prod
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
        },
        "body": json.dumps(body, default=str) # default=str pour gérer datetime/decimal
    }

def success(data=None, message="Success"):
    return api_response(200, {
        "success": True,
        "message": message,
        "data": data
    })

def error(status_code, message, error_code=None):
    return api_response(status_code, {
        "success": False,
        "message": message,
        "error_code": error_code
    })

def get_user_claims(event):
    """
    Extract JWT claims from API Gateway event.
    Supports both REST API (Cognito Authorizer) and HTTP API (JWT Authorizer) formats.
    
    REST API format: event.requestContext.authorizer.claims
    HTTP API format: event.requestContext.authorizer.jwt.claims
    
    Returns dict with claims or empty dict if not found.
    """
    authorizer = event.get('requestContext', {}).get('authorizer', {})
    
    # HTTP API v2 with JWT Authorizer (preferred)
    jwt_claims = authorizer.get('jwt', {}).get('claims', {})
    if jwt_claims:
        return jwt_claims
    
    # REST API with Cognito User Pool Authorizer
    rest_claims = authorizer.get('claims', {})
    if rest_claims:
        return rest_claims
    
    # Fallback: check for lambda authorizer context
    return authorizer

def get_user_sub(event):
    """
    Get user 'sub' (subject) from JWT claims.
    Falls back to x-mock-user-sub header for local testing.
    """
    claims = get_user_claims(event)
    user_sub = claims.get('sub')
    
    if not user_sub:
        # Fallback for local testing
        user_sub = event.get('headers', {}).get('x-mock-user-sub')
    
    return user_sub

def get_http_method(event):
    """
    Get HTTP method from API Gateway event.
    Supports both REST API and HTTP API v2 formats.
    
    REST API: event.httpMethod
    HTTP API v2: event.requestContext.http.method
    """
    # REST API format
    method = event.get('httpMethod')
    if method:
        return method.upper()
    
    # HTTP API v2 format  
    method = event.get('requestContext', {}).get('http', {}).get('method')
    if method:
        return method.upper()
    
    return None

def get_path_parameters(event):
    """
    Get path parameters from API Gateway event.
    Supports both REST API and HTTP API v2 formats.
    """
    return event.get('pathParameters') or {}

def get_route_key(event):
    """
    Get route key from HTTP API v2 event (e.g., 'GET /users/me').
    Returns None for REST API events.
    """
    return event.get('routeKey')


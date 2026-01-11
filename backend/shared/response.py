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

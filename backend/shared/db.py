import boto3
import os
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

# Client DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

def get_table(table_name):
    """Récupère une table DynamoDB."""
    return dynamodb.Table(table_name)

def put_item(table_name, item):
    """Insère ou met à jour un item."""
    table = get_table(table_name)
    table.put_item(Item=item)
    return item

def get_item(table_name, key):
    """Récupère un item par sa clé primaire."""
    table = get_table(table_name)
    response = table.get_item(Key=key)
    return response.get('Item')

def query_items(table_name, key_condition, filter_expression=None, index_name=None):
    """Query items avec condition."""
    table = get_table(table_name)
    
    kwargs = {
        'KeyConditionExpression': key_condition
    }
    
    if filter_expression:
        kwargs['FilterExpression'] = filter_expression
    
    if index_name:
        kwargs['IndexName'] = index_name
    
    response = table.query(**kwargs)
    return response.get('Items', [])

def scan_items(table_name, filter_expression=None, limit=10):
    """
    Scan table with filter (use sparingly - prefer query with GSI).
    Limited to prevent expensive full table scans.
    """
    table = get_table(table_name)
    
    kwargs = {'Limit': limit}  # Limit to prevent runaway costs
    if filter_expression:
        kwargs['FilterExpression'] = filter_expression
    
    response = table.scan(**kwargs)
    return response.get('Items', [])

def delete_item(table_name, key):
    """Supprime un item."""
    table = get_table(table_name)
    table.delete_item(Key=key)
    return True

def update_item(table_name, key, update_expression, expression_values, expression_names=None):
    """Met à jour un item."""
    table = get_table(table_name)
    
    kwargs = {
        'Key': key,
        'UpdateExpression': update_expression,
        'ExpressionAttributeValues': expression_values,
        'ReturnValues': 'ALL_NEW'
    }
    
    if expression_names:
        kwargs['ExpressionAttributeNames'] = expression_names
    
    response = table.update_item(**kwargs)
    return response.get('Attributes')

# Converter pour DynamoDB (float -> Decimal)
def convert_floats(obj):
    """Convertit les float en Decimal pour DynamoDB."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: convert_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats(item) for item in obj]
    return obj

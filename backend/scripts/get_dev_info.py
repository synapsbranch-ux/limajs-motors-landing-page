#!/usr/bin/env python3
"""
Script pour récupérer les informations de déploiement et générer devinfo.md
"""

import boto3
import json
from datetime import datetime

STACK_NAME = "LimajsMotorsStack"
OUTPUT_FILE = "devinfo.md"

def get_stack_outputs():
    """Récupère les outputs de la stack CloudFormation"""
    cf = boto3.client('cloudformation', region_name='us-east-1')
    
    try:
        response = cf.describe_stacks(StackName=STACK_NAME)
        stack = response['Stacks'][0]
        
        outputs = {}
        for output in stack.get('Outputs', []):
            outputs[output['OutputKey']] = output['OutputValue']
        
        return {
            'outputs': outputs,
            'status': stack['StackStatus'],
            'last_updated': stack.get('LastUpdatedTime', stack.get('CreationTime')),
            'description': stack.get('Description', 'N/A')
        }
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def get_dynamodb_tables():
    """Liste les tables DynamoDB limajs"""
    dynamodb = boto3.client('dynamodb', region_name='us-east-1')
    
    tables = []
    paginator = dynamodb.get_paginator('list_tables')
    for page in paginator.paginate():
        for table in page['TableNames']:
            if 'limajs' in table.lower():
                tables.append(table)
    return tables

def get_lambda_functions():
    """Liste les fonctions Lambda du projet"""
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    
    functions = []
    paginator = lambda_client.get_paginator('list_functions')
    for page in paginator.paginate():
        for fn in page['Functions']:
            if 'Limajs' in fn['FunctionName'] or 'limajs' in fn['FunctionName'].lower():
                functions.append({
                    'name': fn['FunctionName'],
                    'runtime': fn['Runtime'],
                    'memory': fn['MemorySize'],
                    'timeout': fn['Timeout']
                })
    return functions

def generate_markdown(stack_info, tables, lambdas):
    """Génère le fichier markdown avec toutes les infos"""
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    md = f"""# 🚀 LimaJS Motors - Dev Info

> Généré le {now}

---

## 📡 Endpoints & URLs

| Resource | URL |
|----------|-----|
"""
    
    if stack_info:
        outputs = stack_info['outputs']
        md += f"| **API Gateway** | `{outputs.get('ApiGatewayURL', 'N/A')}` |\n"
        md += f"| **CloudFront** | `{outputs.get('CloudFrontURL', 'N/A')}` |\n"
        md += f"| **S3 Bucket** | `{outputs.get('S3BucketName', 'N/A')}` |\n"
        md += f"| **CloudFront Dist ID** | `{outputs.get('DistributionId', 'N/A')}` |\n"
        md += f"| **Secret Name** | `{outputs.get('SecretName', 'N/A')}` |\n"
        
        md += f"""
---

## 📊 Stack Status

| Info | Valeur |
|------|--------|
| Stack Name | `{STACK_NAME}` |
| Status | `{stack_info['status']}` |
| Last Updated | `{stack_info['last_updated']}` |

"""
    
    # Routes API
    api_url = stack_info['outputs'].get('ApiGatewayURL', 'https://API_URL/') if stack_info else 'https://API_URL/'
    
    md += f"""---

## 🔗 Routes Backend

### Auth
- `POST {api_url}auth/signup`
- `POST {api_url}auth/login`

### Users
- `GET {api_url}users/me`
- `PUT {api_url}users/me`
- `POST {api_url}users/me/photo`

### Buses
- `GET/POST {api_url}buses`
- `GET/PUT/DELETE {api_url}buses/{{id}}`

### Routes
- `GET/POST {api_url}routes`
- `GET/PUT/DELETE {api_url}routes/{{id}}`

### Schedules
- `GET/POST {api_url}schedules`

### Trips (Driver App)
- `POST {api_url}trips/start`
- `POST {api_url}trips/end`
- `POST {api_url}trips/board`
- `POST {api_url}trips/alight`
- `GET {api_url}trips/current/passengers`

### GPS
- `POST {api_url}gps/batch`

### Subscriptions
- `GET {api_url}subscriptions/types`
- `POST {api_url}subscriptions`
- `GET {api_url}subscriptions/active`

### Payments
- `POST {api_url}payments/presigned-url`
- `POST {api_url}payments/upload`

### Admin
- `GET {api_url}admin/users`
- `GET {api_url}admin/reports/dashboard`

### Contact
- `POST {api_url}contact`

"""
    
    # DynamoDB Tables
    md += f"""---

## 🗄️ DynamoDB Tables ({len(tables)})

| Table Name |
|------------|
"""
    for table in tables:
        md += f"| `{table}` |\n"
    
    # Lambda Functions
    md += f"""
---

## ⚡ Lambda Functions ({len(lambdas)})

| Function | Runtime | Memory | Timeout |
|----------|---------|--------|---------|
"""
    for fn in lambdas:
        md += f"| `{fn['name']}` | {fn['runtime']} | {fn['memory']}MB | {fn['timeout']}s |\n"
    
    # Test commands
    md += f"""
---

## 🧪 Test Commands

```bash
# Test API health (buses endpoint)
curl {api_url}buses

# Test with authorization
curl -H "Authorization: Bearer YOUR_TOKEN" {api_url}users/me
```

---

## 🔧 Useful AWS CLI Commands

```bash
# View stack outputs
aws cloudformation describe-stacks --stack-name {STACK_NAME} --query "Stacks[0].Outputs"

# View Lambda logs
aws logs tail /aws/lambda/LimajsMotorsStack-FnLogin --follow

# Get secret value
aws secretsmanager get-secret-value --secret-id limajs/backend/production --query SecretString --output text
```
"""
    
    return md

def main():
    print("🔍 Récupération des informations de déploiement...")
    
    print("  → Stack CloudFormation...")
    stack_info = get_stack_outputs()
    
    print("  → Tables DynamoDB...")
    tables = get_dynamodb_tables()
    
    print("  → Fonctions Lambda...")
    lambdas = get_lambda_functions()
    
    print(f"\n📝 Génération de {OUTPUT_FILE}...")
    md_content = generate_markdown(stack_info, tables, lambdas)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"✅ Fichier {OUTPUT_FILE} créé avec succès!")
    
    if stack_info:
        print(f"\n📡 API URL: {stack_info['outputs'].get('ApiGatewayURL', 'N/A')}")
        print(f"🌐 CloudFront: {stack_info['outputs'].get('CloudFrontURL', 'N/A')}")

if __name__ == "__main__":
    main()

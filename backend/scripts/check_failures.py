#!/usr/bin/env python3
"""Get detailed error responses for failed endpoints."""

import requests
import boto3
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Auth
client = boto3.client('cognito-idp', region_name='us-east-1')
response = client.initiate_auth(
    ClientId='6vilq0et60jovueorl2p0o6gcp',
    AuthFlow='USER_PASSWORD_AUTH',
    AuthParameters={
        'USERNAME': 'test.passenger@limajs.com',
        'PASSWORD': 'TestPass123!'
    }
)
token = response['AuthenticationResult']['AccessToken']
headers = {'Authorization': f'Bearer {token}'}

BASE_URL = 'https://bekioazd5d.execute-api.us-east-1.amazonaws.com'

# Failed endpoints to check
endpoints = [
    '/subscriptions/active',
    '/tickets/history',
    '/admin/users',
    '/admin/reports/dashboard'
]

print("=" * 60)
print("DETAILED ERROR RESPONSES FOR FAILED ENDPOINTS")
print("=" * 60)

# Check PUT /users/me separately
print("\n--- PUT /users/me ---")
resp = requests.put(f'{BASE_URL}/users/me', headers=headers, json={'name': 'Updated Name'}, timeout=30)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.text[:300]}")

for endpoint in endpoints:
    resp = requests.get(f'{BASE_URL}{endpoint}', headers=headers, timeout=30)
    print(f"\n--- {endpoint} ---")
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:300]}")

#!/usr/bin/env python3
"""
LimaJS Motors - Comprehensive API Test Suite with Authentication

This script creates test users, authenticates them, and tests all API endpoints.
Run: python test_api.py

Requirements:
    pip install requests boto3
"""

import requests
import json
import time
import sys
import io
import boto3
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

# Fix Windows console encoding for emojis
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Configuration
BASE_URL = "https://bekioazd5d.execute-api.us-east-1.amazonaws.com"
COGNITO_USER_POOL_ID = "us-east-1_78ANoaZy1"
COGNITO_CLIENT_ID = "6vilq0et60jovueorl2p0o6gcp"
AWS_REGION = "us-east-1"
TIMEOUT = 30

# Test users configuration
TEST_USERS = {
    "passenger": {
        "email": "test.passenger@limajs.com",
        "password": "TestPass123!",
        "firstName": "PassengerTest",
        "lastName": "User",
        "phone": "+509 1111 1111",
        "role": "passenger"
    },
    "driver": {
        "email": "test.driver@limajs.com",
        "password": "TestPass123!",
        "firstName": "DriverTest",
        "lastName": "User",
        "phone": "+509 2222 2222",
        "role": "driver"
    },
    "admin": {
        "email": "test.admin@limajs.com",
        "password": "TestPass123!",
        "firstName": "AdminTest",
        "lastName": "User",
        "phone": "+509 3333 3333",
        "role": "admin"
    }
}


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


class TestResult:
    def __init__(self, name: str, passed: bool, message: str = "", response: Any = None):
        self.name = name
        self.passed = passed
        self.message = message
        self.response = response
        self.timestamp = datetime.now()


class CognitoManager:
    """Manages Cognito user operations for testing."""
    
    def __init__(self, pool_id: str, client_id: str, region: str):
        self.pool_id = pool_id
        self.client_id = client_id
        self.region = region
        self.client = boto3.client('cognito-idp', region_name=region)
    
    def create_user(self, email: str, password: str, attributes: Dict) -> bool:
        """Create a user in Cognito (admin operation)."""
        try:
            # Check if user exists
            try:
                self.client.admin_get_user(
                    UserPoolId=self.pool_id,
                    Username=email
                )
                print(f"    [INFO] User {email} already exists")
                return True
            except self.client.exceptions.UserNotFoundException:
                pass
            
            # Create user with standard attributes only
            user_attributes = [
                {'Name': 'email', 'Value': email},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'given_name', 'Value': attributes.get('firstName', '')},
                {'Name': 'family_name', 'Value': attributes.get('lastName', '')},
            ]
            
            # Only add phone if it's a valid format
            phone = attributes.get('phone', '').replace(' ', '')
            if phone and phone.startswith('+'):
                user_attributes.append({'Name': 'phone_number', 'Value': phone})
            
            self.client.admin_create_user(
                UserPoolId=self.pool_id,
                Username=email,
                UserAttributes=user_attributes,
                TemporaryPassword=password,
                MessageAction='SUPPRESS'  # Don't send email
            )
            
            # Set permanent password
            self.client.admin_set_user_password(
                UserPoolId=self.pool_id,
                Username=email,
                Password=password,
                Permanent=True
            )
            
            print(f"    [OK] User {email} created successfully")
            return True
            
        except Exception as e:
            print(f"    [ERROR] Failed to create user {email}: {e}")
            return False
    
    def authenticate(self, email: str, password: str) -> Optional[str]:
        """Authenticate user and return access token."""
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password
                }
            )
            
            if 'AuthenticationResult' in response:
                return response['AuthenticationResult']['AccessToken']
            elif 'ChallengeName' in response:
                print(f"    [WARN] Challenge required: {response['ChallengeName']}")
                return None
                
        except Exception as e:
            print(f"    [ERROR] Authentication failed for {email}: {e}")
            return None
    
    def delete_user(self, email: str) -> bool:
        """Delete a user from Cognito."""
        try:
            self.client.admin_delete_user(
                UserPoolId=self.pool_id,
                Username=email
            )
            return True
        except:
            return False


class APITestSuite:
    """Comprehensive test suite for LimaJS Motors API with authentication."""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip('/')
        self.results: list[TestResult] = []
        self.cognito = CognitoManager(COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, AWS_REGION)
        
        # Authenticated tokens
        self.tokens: Dict[str, str] = {}
        self.current_role: str = "passenger"
        
    def log(self, message: str, color: str = Colors.RESET):
        print(f"{color}{message}{Colors.RESET}")
        
    def log_test(self, result: TestResult):
        status = f"{Colors.GREEN}✓ PASS" if result.passed else f"{Colors.RED}✗ FAIL"
        self.log(f"{status}{Colors.RESET} {result.name}")
        if result.message:
            self.log(f"    └─ {result.message}", Colors.YELLOW if not result.passed else Colors.RESET)
    
    def request(self, method: str, endpoint: str, data: Dict = None, 
                token: str = None, expected_status: int = 200) -> TestResult:
        """Make API request and return result."""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            response = requests.request(
                method=method,
                url=url,
                json=data,
                headers=headers,
                timeout=TIMEOUT
            )
            
            passed = response.status_code == expected_status
            try:
                resp_json = response.json()
            except:
                resp_json = {"raw": response.text[:500]}
            
            return TestResult(
                name=f"{method} {endpoint}",
                passed=passed,
                message=f"Status: {response.status_code}" + (f" (expected {expected_status})" if not passed else ""),
                response=resp_json
            )
        except Exception as e:
            return TestResult(
                name=f"{method} {endpoint}",
                passed=False,
                message=f"Error: {str(e)}"
            )
    
    # ========================================
    # SETUP: Create Test Users
    # ========================================
    
    def setup_test_users(self):
        """Create test users in Cognito."""
        self.log("\n" + "="*60, Colors.BOLD)
        self.log("🔧 SETUP: Creating Test Users in Cognito", Colors.BLUE)
        self.log("="*60, Colors.BOLD)
        
        for role, user_data in TEST_USERS.items():
            self.log(f"\n  Creating {role} user: {user_data['email']}")
            self.cognito.create_user(
                email=user_data['email'],
                password=user_data['password'],
                attributes=user_data
            )
    
    def authenticate_users(self):
        """Authenticate all test users and store tokens."""
        self.log("\n" + "="*60, Colors.BOLD)
        self.log("🔐 Authenticating Test Users", Colors.BLUE)
        self.log("="*60, Colors.BOLD)
        
        for role, user_data in TEST_USERS.items():
            self.log(f"\n  Authenticating {role}: {user_data['email']}")
            token = self.cognito.authenticate(user_data['email'], user_data['password'])
            if token:
                self.tokens[role] = token
                self.log(f"    [OK] Token: {token[:40]}...", Colors.GREEN)
            else:
                self.log(f"    [FAIL] Could not authenticate {role}", Colors.RED)
    
    def get_token(self, role: str = None) -> Optional[str]:
        """Get token for specified role or current role."""
        return self.tokens.get(role or self.current_role)
    
    # ========================================
    # 1. PUBLIC ENDPOINTS (No Auth)
    # ========================================
    
    def test_public_endpoints(self):
        """Test endpoints that don't require authentication."""
        self.log("\n" + "="*60, Colors.BOLD)
        self.log("📡 PUBLIC ENDPOINTS (No Auth Required)", Colors.CYAN)
        self.log("="*60, Colors.BOLD)
        
        # Contact Form
        result = self.request("POST", "/contact", {
            "name": "Test User",
            "email": "test@example.com",
            "message": "API test message"
        })
        self.results.append(result)
        self.log_test(result)
        
        # Subscription Types
        result = self.request("GET", "/subscriptions/types")
        self.results.append(result)
        self.log_test(result)
    
    # ========================================
    # 2. PASSENGER TESTS
    # ========================================
    
    def test_passenger_endpoints(self):
        """Test passenger-specific endpoints."""
        token = self.get_token("passenger")
        if not token:
            self.log("\n[SKIP] Passenger tests - no token available", Colors.YELLOW)
            return
            
        self.log("\n" + "="*60, Colors.BOLD)
        self.log("👤 PASSENGER ENDPOINTS", Colors.CYAN)
        self.log("="*60, Colors.BOLD)
        
        # Profile
        self.log("\n--- Profile ---")
        result = self.request("GET", "/users/me", token=token)
        self.results.append(result)
        self.log_test(result)
        
        result = self.request("PUT", "/users/me", {
            "firstName": "UpdatedPassenger",
            "phone": "+509 1111 9999"
        }, token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Routes
        self.log("\n--- Routes & Schedules ---")
        result = self.request("GET", "/routes", token=token)
        self.results.append(result)
        self.log_test(result)
        
        result = self.request("GET", "/schedules", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Buses
        result = self.request("GET", "/buses", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Subscriptions
        self.log("\n--- Subscriptions ---")
        result = self.request("GET", "/subscriptions/active", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Tickets
        self.log("\n--- Tickets ---")
        result = self.request("GET", "/tickets/my", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Wallet
        self.log("\n--- Wallet ---")
        result = self.request("GET", "/wallet/balance", token=token)
        self.results.append(result)
        self.log_test(result)
        
        result = self.request("GET", "/wallet/transactions", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # History
        self.log("\n--- History ---")
        result = self.request("GET", "/trips/history", token=token)
        self.results.append(result)
        self.log_test(result)
        
        result = self.request("GET", "/payments/history", token=token)
        self.results.append(result)
        self.log_test(result)
    
    # ========================================
    # 3. DRIVER TESTS
    # ========================================
    
    def test_driver_endpoints(self):
        """Test driver-specific endpoints."""
        token = self.get_token("driver")
        if not token:
            self.log("\n[SKIP] Driver tests - no token available", Colors.YELLOW)
            return
            
        self.log("\n" + "="*60, Colors.BOLD)
        self.log("🚌 DRIVER ENDPOINTS", Colors.CYAN)
        self.log("="*60, Colors.BOLD)
        
        # Profile
        self.log("\n--- Driver Profile ---")
        result = self.request("GET", "/users/me", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Note: Trip start/board/alight/end require valid bus/route IDs
        # These would typically be tested with proper fixtures
        self.log("\n[INFO] Trip management endpoints require valid bus/route IDs")
    
    # ========================================
    # 4. ADMIN TESTS
    # ========================================
    
    def test_admin_endpoints(self):
        """Test admin-specific endpoints."""
        token = self.get_token("admin")
        if not token:
            self.log("\n[SKIP] Admin tests - no token available", Colors.YELLOW)
            return
            
        self.log("\n" + "="*60, Colors.BOLD)
        self.log("🔒 ADMIN ENDPOINTS", Colors.CYAN)
        self.log("="*60, Colors.BOLD)
        
        # Admin Users List
        self.log("\n--- Admin: Users ---")
        result = self.request("GET", "/admin/users", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Admin Dashboard
        self.log("\n--- Admin: Dashboard ---")
        result = self.request("GET", "/admin/reports/dashboard", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Bus Management
        self.log("\n--- Admin: Bus Management ---")
        result = self.request("GET", "/buses", token=token)
        self.results.append(result)
        self.log_test(result)
        
        # Route Management
        result = self.request("GET", "/routes", token=token)
        self.results.append(result)
        self.log_test(result)
    
    # ========================================
    # RUN ALL TESTS
    # ========================================
    
    def run_all(self):
        """Run all tests with proper setup."""
        start_time = datetime.now()
        
        self.log(f"\n{'='*60}", Colors.BOLD)
        self.log("🧪 LimaJS Motors - Comprehensive API Test Suite", Colors.BOLD)
        self.log(f"{'='*60}", Colors.BOLD)
        self.log(f"Base URL: {self.base_url}")
        self.log(f"Cognito Pool: {COGNITO_USER_POOL_ID}")
        self.log(f"Started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Setup
        self.setup_test_users()
        self.authenticate_users()
        
        # Run tests by category
        self.test_public_endpoints()
        self.test_passenger_endpoints()
        self.test_driver_endpoints()
        self.test_admin_endpoints()
        
        # Generate report
        self.generate_report(start_time)
    
    def generate_report(self, start_time: datetime):
        """Generate test report."""
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        passed = sum(1 for r in self.results if r.passed)
        failed = len(self.results) - passed
        
        self.log(f"\n{'='*60}", Colors.BOLD)
        self.log("📊 TEST RESULTS SUMMARY", Colors.BOLD)
        self.log(f"{'='*60}", Colors.BOLD)
        
        self.log(f"\n✅ Passed: {passed}", Colors.GREEN)
        self.log(f"❌ Failed: {failed}", Colors.RED if failed > 0 else Colors.RESET)
        self.log(f"📋 Total:  {len(self.results)}")
        self.log(f"⏱️ Duration: {duration:.2f}s")
        
        # Authenticated users
        self.log(f"\n🔐 Authenticated: {len(self.tokens)}/{len(TEST_USERS)} users")
        for role, token in self.tokens.items():
            self.log(f"  • {role}: ✅", Colors.GREEN)
        for role in TEST_USERS:
            if role not in self.tokens:
                self.log(f"  • {role}: ❌", Colors.RED)
        
        if failed > 0:
            self.log(f"\n{Colors.RED}Failed Tests:{Colors.RESET}")
            for r in self.results:
                if not r.passed:
                    self.log(f"  • {r.name}: {r.message}", Colors.RED)
        
        # Success rate
        rate = (passed / len(self.results) * 100) if self.results else 0
        color = Colors.GREEN if rate >= 80 else Colors.YELLOW if rate >= 50 else Colors.RED
        self.log(f"\n{color}Success Rate: {rate:.1f}%{Colors.RESET}")
        
        return passed, failed


def main():
    """Run the test suite."""
    suite = APITestSuite()
    suite.run_all()


if __name__ == "__main__":
    main()

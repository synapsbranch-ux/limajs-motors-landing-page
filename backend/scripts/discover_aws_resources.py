#!/usr/bin/env python3
"""
AWS Resource Discovery Script for LimajsMotors

This script discovers and documents all AWS resources associated with
the LimajsMotorsStack CloudFormation stack. Run this script to get a
comprehensive view of your production infrastructure.

Requirements:
    pip install boto3

Usage:
    python discover_aws_resources.py
    
    # Output to a file:
    python discover_aws_resources.py > aws_resources.json
"""

import json
import boto3
from botocore.exceptions import ClientError

STACK_NAME = "LimajsMotorsStack"
REGION = "us-east-1"

# Known hardcoded resources (for reference even if stack lookup fails)
KNOWN_RESOURCES = {
    "cloudfront_distribution_id": "E1Q1BZNJDUG1VU",
    "s3_frontend_bucket": "limajsmotorsstack-limajsmotorsfrontendbucketdd54cd-ksskae8irblk",
}


def get_cloudformation_outputs(cf_client, stack_name):
    """Fetch all outputs from a CloudFormation stack."""
    try:
        response = cf_client.describe_stacks(StackName=stack_name)
        if response["Stacks"]:
            outputs = response["Stacks"][0].get("Outputs", [])
            return {out["OutputKey"]: out["OutputValue"] for out in outputs}
    except ClientError as e:
        print(f"Warning: Could not fetch stack outputs: {e}")
    return {}


def get_cloudformation_resources(cf_client, stack_name):
    """Fetch all resources managed by a CloudFormation stack."""
    resources = []
    try:
        paginator = cf_client.get_paginator("list_stack_resources")
        for page in paginator.paginate(StackName=stack_name):
            for resource in page.get("StackResourceSummaries", []):
                resources.append({
                    "LogicalId": resource["LogicalResourceId"],
                    "PhysicalId": resource.get("PhysicalResourceId", "N/A"),
                    "Type": resource["ResourceType"],
                    "Status": resource["ResourceStatus"],
                })
    except ClientError as e:
        print(f"Warning: Could not list stack resources: {e}")
    return resources


def get_lambda_functions(lambda_client, function_names):
    """Fetch details for specific Lambda functions."""
    functions = []
    for name in function_names:
        try:
            response = lambda_client.get_function(FunctionName=name)
            config = response["Configuration"]
            functions.append({
                "FunctionName": config["FunctionName"],
                "FunctionArn": config["FunctionArn"],
                "Runtime": config["Runtime"],
                "Handler": config["Handler"],
                "MemorySize": config["MemorySize"],
                "Timeout": config["Timeout"],
                "LastModified": config["LastModified"],
            })
        except ClientError:
            pass  # Function not found or no permission
    return functions


def get_dynamodb_tables(dynamodb_client, table_names):
    """Fetch details for specific DynamoDB tables."""
    tables = []
    for name in table_names:
        try:
            response = dynamodb_client.describe_table(TableName=name)
            table = response["Table"]
            tables.append({
                "TableName": table["TableName"],
                "TableArn": table["TableArn"],
                "ItemCount": table.get("ItemCount", 0),
                "TableSizeBytes": table.get("TableSizeBytes", 0),
                "TableStatus": table["TableStatus"],
            })
        except ClientError:
            pass  # Table not found
    return tables


def get_secrets_manager(sm_client, secret_name):
    """Fetch Secrets Manager secret metadata (not the actual secret value)."""
    try:
        response = sm_client.describe_secret(SecretId=secret_name)
        return {
            "Name": response["Name"],
            "ARN": response["ARN"],
            "Description": response.get("Description", ""),
            "LastChangedDate": str(response.get("LastChangedDate", "")),
        }
    except ClientError:
        return None


def get_api_gateway(apigw_client, api_name_contains="Limajs"):
    """Fetch HTTP API Gateway details."""
    apis = []
    try:
        response = apigw_client.get_apis()
        for api in response.get("Items", []):
            if api_name_contains.lower() in api.get("Name", "").lower():
                apis.append({
                    "ApiId": api["ApiId"],
                    "Name": api["Name"],
                    "ApiEndpoint": api.get("ApiEndpoint", ""),
                    "ProtocolType": api["ProtocolType"],
                })
    except ClientError as e:
        print(f"Warning: Could not fetch APIs: {e}")
    return apis


def get_cloudfront_distribution(cf_client, distribution_id):
    """Fetch CloudFront distribution details."""
    try:
        response = cf_client.get_distribution(Id=distribution_id)
        dist = response["Distribution"]
        config = dist["DistributionConfig"]
        return {
            "Id": dist["Id"],
            "DomainName": dist["DomainName"],
            "Status": dist["Status"],
            "Enabled": config["Enabled"],
            "DefaultRootObject": config.get("DefaultRootObject", ""),
            "Origins": [
                {"Id": o["Id"], "DomainName": o["DomainName"]}
                for o in config["Origins"]["Items"]
            ],
            "Aliases": config.get("Aliases", {}).get("Items", []),
        }
    except ClientError as e:
        print(f"Warning: Could not fetch CloudFront distribution: {e}")
    return None


def get_s3_bucket_info(s3_client, bucket_name):
    """Fetch S3 bucket metadata."""
    try:
        # Check if bucket exists by getting its location
        s3_client.head_bucket(Bucket=bucket_name)
        
        # Get bucket policy
        try:
            policy = s3_client.get_bucket_policy(Bucket=bucket_name)
            policy_text = policy.get("Policy", "{}")
        except ClientError:
            policy_text = "No policy or access denied"
        
        return {
            "BucketName": bucket_name,
            "Exists": True,
            "Policy": policy_text[:500] + "..." if len(policy_text) > 500 else policy_text,
        }
    except ClientError as e:
        return {"BucketName": bucket_name, "Exists": False, "Error": str(e)}


def main():
    print("=" * 60)
    print("  LimajsMotors AWS Resource Discovery")
    print("=" * 60)
    print(f"Stack Name: {STACK_NAME}")
    print(f"Region: {REGION}")
    print("-" * 60)

    # Initialize clients
    session = boto3.Session(region_name=REGION)
    cf_client = session.client("cloudformation")
    lambda_client = session.client("lambda")
    dynamodb_client = session.client("dynamodb")
    sm_client = session.client("secretsmanager")
    apigw_client = session.client("apigatewayv2")
    cloudfront_client = session.client("cloudfront")
    s3_client = session.client("s3")

    # Collect all resources
    resources = {
        "stack_name": STACK_NAME,
        "region": REGION,
        "known_hardcoded_resources": KNOWN_RESOURCES,
    }

    # 1. CloudFormation Outputs
    print("\n[1/7] Fetching CloudFormation Outputs...")
    resources["cloudformation_outputs"] = get_cloudformation_outputs(cf_client, STACK_NAME)
    print(f"  Found {len(resources['cloudformation_outputs'])} outputs")

    # 2. CloudFormation Resources
    print("\n[2/7] Fetching CloudFormation Managed Resources...")
    cf_resources = get_cloudformation_resources(cf_client, STACK_NAME)
    resources["cloudformation_resources"] = cf_resources
    print(f"  Found {len(cf_resources)} resources")

    # 3. Lambda Functions (from CF resources)
    print("\n[3/7] Fetching Lambda Function Details...")
    lambda_names = [
        r["PhysicalId"] for r in cf_resources
        if r["Type"] == "AWS::Lambda::Function"
    ]
    resources["lambda_functions"] = get_lambda_functions(lambda_client, lambda_names)
    print(f"  Found {len(resources['lambda_functions'])} Lambda functions")

    # 4. DynamoDB Tables
    print("\n[4/7] Fetching DynamoDB Tables...")
    table_names = [
        "limajs-users", "limajs-buses", "limajs-routes", "limajs-schedules",
        "limajs-subscriptions", "limajs-payments", "limajs-tickets",
        "limajs-nfc-cards", "limajs-trips", "limajs-gps-positions",
        "limajs-websocket-connections", "limajs-notifications",
        "limajs-invoices", "limajs-wallet-transactions", "limajs-passenger-trips",
    ]
    resources["dynamodb_tables"] = get_dynamodb_tables(dynamodb_client, table_names)
    print(f"  Found {len(resources['dynamodb_tables'])} DynamoDB tables")

    # 5. Secrets Manager
    print("\n[5/7] Fetching Secrets Manager Info...")
    secret_info = get_secrets_manager(sm_client, "limajs/backend/production")
    resources["secrets_manager"] = secret_info if secret_info else "Not found or access denied"
    print(f"  Secret: {'Found' if secret_info else 'Not found'}")

    # 6. API Gateway
    print("\n[6/7] Fetching API Gateway...")
    resources["api_gateways"] = get_api_gateway(apigw_client)
    print(f"  Found {len(resources['api_gateways'])} API(s)")

    # 7. CloudFront Distribution
    print("\n[7/7] Fetching CloudFront Distribution...")
    dist_id = KNOWN_RESOURCES["cloudfront_distribution_id"]
    resources["cloudfront_distribution"] = get_cloudfront_distribution(cloudfront_client, dist_id)
    print(f"  Distribution: {dist_id}")

    # 8. S3 Bucket
    print("\n[Bonus] Fetching S3 Frontend Bucket Info...")
    bucket_name = KNOWN_RESOURCES["s3_frontend_bucket"]
    resources["s3_frontend_bucket"] = get_s3_bucket_info(s3_client, bucket_name)
    print(f"  Bucket: {bucket_name}")

    # Output JSON
    print("\n" + "=" * 60)
    print("  JSON OUTPUT")
    print("=" * 60)
    print(json.dumps(resources, indent=2, default=str))

    return resources


if __name__ == "__main__":
    main()

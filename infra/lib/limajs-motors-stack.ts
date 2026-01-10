import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';

export class LimajsMotorsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // --- Configuration from Environment (GitHub Secrets) ---
        const resendApiKey = process.env.RESEND_API_KEY || 'placeholder_key';
        const adminEmails = process.env.ADMIN_EMAILS || 'limajsmotorssa@gmail.com,mainoffice@limajs.com';
        const fromEmail = process.env.FROM_EMAIL || 'contact@limajs.com';
        const bucketName = process.env.TARGET_BUCKET_NAME; // Optional, creates random if undefined

        // 1. S3 Bucket for Frontend Hosting
        const websiteBucket = new s3.Bucket(this, 'LimajsMotorsFrontendBucket', {
            bucketName: bucketName, // If Env var is set, use it. Else auto-generate.
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            cors: [
                {
                    allowedMethods: [s3.HttpMethods.GET],
                    allowedOrigins: ['*'],
                    allowedHeaders: ['*'],
                }
            ]
        });

        // 2. CloudFront Distribution
        const distribution = new cloudfront.Distribution(this, 'LimajsMotorsDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                compress: true,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        });

        // 3. Secrets Manager for Backend
        // Injects the GitHub Secret (RESEND_API_KEY) into the AWS Secret
        const apiSecrets = new secretsmanager.Secret(this, 'LimajsbackendSecrets', {
            secretName: 'limajs/backend/production',
            description: 'Configuration for Limajs Backend',
            secretStringValue: cdk.SecretValue.unsafePlainText(JSON.stringify({
                RESEND_API_KEY: resendApiKey,
                ADMIN_EMAILS: adminEmails,
                FROM_EMAIL: fromEmail
            })),
        });

        // 4. Lambda Function (Backend)
        const contactLambda = new lambda.Function(this, 'ContactFormHandler', {
            runtime: lambda.Runtime.NODEJS_22_X, // Latest LTS
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/contact-form')),
            environment: {
                // Pass the Secret Name so the code knows where to fetch it
                SECRET_NAME: apiSecrets.secretName,
            },
            timeout: cdk.Duration.seconds(10),
        });

        // Grant permission to read the secret
        apiSecrets.grantRead(contactLambda);

        // 5. API Gateway (HTTP API)
        const httpApi = new apigwv2.HttpApi(this, 'LimajsMotorsApi', {
            corsPreflight: {
                allowHeaders: ['Content-Type', 'Authorization'],
                allowMethods: [
                    apigwv2.CorsHttpMethod.POST,
                    apigwv2.CorsHttpMethod.OPTIONS,
                ],
                allowOrigins: ['*'],
            },
        });

        httpApi.addRoutes({
            path: '/contact',
            methods: [apigwv2.HttpMethod.POST],
            integration: new apigwv2_integrations.HttpLambdaIntegration(
                'ContactIntegration',
                contactLambda
            ),
        });

        // 6. Outputs 
        new cdk.CfnOutput(this, 'CloudFrontURL', {
            value: `https://${distribution.distributionDomainName}`,
            description: 'The URL of the frontend application',
        });

        new cdk.CfnOutput(this, 'ApiGatewayURL', {
            value: httpApi.url!,
            description: 'The URL of the API Gateway',
        });

        new cdk.CfnOutput(this, 'DistributionId', {
            value: distribution.distributionId,
            description: 'CloudFront Distribution ID',
        });

        new cdk.CfnOutput(this, 'S3BucketName', {
            value: websiteBucket.bucketName,
            description: 'The name of the S3 bucket',
        });
    }
}

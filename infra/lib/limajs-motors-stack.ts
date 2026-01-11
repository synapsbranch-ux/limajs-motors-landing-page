import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as path from 'path';

export class LimajsMotorsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // --- Configuration (from GitHub Secrets via env vars) ---
        const resendApiKey = process.env.RESEND_API_KEY || '';
        const adminEmails = process.env.ADMIN_EMAILS || 'limajsmotorssa@gmail.com,mainoffice@limajs.com';
        const fromEmail = process.env.FROM_EMAIL || 'contact@limajs.com';
        const bucketName = process.env.TARGET_BUCKET_NAME;

        // --- 1. S3 Frontend ---
        const websiteBucket = new s3.Bucket(this, 'LimajsMotorsFrontendBucket', {
            bucketName: bucketName,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            cors: [{ allowedMethods: [s3.HttpMethods.GET], allowedOrigins: ['*'], allowedHeaders: ['*'] }]
        });

        // --- S3 Bucket for Invoices ---
        const invoicesBucket = new s3.Bucket(this, 'LimajsInvoicesBucket', {
            bucketName: 'limajs-invoices',
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            cors: [{ allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT], allowedOrigins: ['*'], allowedHeaders: ['*'] }]
        });

        // Create Origin Access Identity (OAI) for CloudFront
        const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');

        // Grant read permissions for this bucket to the OAI
        websiteBucket.grantRead(originAccessIdentity);

        const distribution = new cloudfront.Distribution(this, 'LimajsMotorsDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket, {
                    originAccessIdentity: originAccessIdentity
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                compress: true,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            defaultRootObject: 'index.html',
            errorResponses: [{ httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' }],
        });

        // --- 2. Secrets Manager ---
        const apiSecrets = new secretsmanager.Secret(this, 'LimajsbackendSecrets', {
            secretName: 'limajs/backend/production',
            description: 'Configuration for Limajs Backend',
            secretStringValue: cdk.SecretValue.unsafePlainText(JSON.stringify({
                RESEND_API_KEY: resendApiKey,
                ADMIN_EMAILS: adminEmails,
                FROM_EMAIL: fromEmail
            })),
        });

        // --- 3. Existing Resources (DynamoDB Tables) ---
        const tableNames = [
            'limajs-users', 'limajs-buses', 'limajs-routes', 'limajs-schedules',
            'limajs-subscriptions', 'limajs-payments', 'limajs-tickets',
            'limajs-nfc-cards', 'limajs-trips', 'limajs-gps-positions',
            'limajs-websocket-connections', 'limajs-notifications',
            // New tables for wallet/invoices
            'limajs-invoices', 'limajs-wallet-transactions', 'limajs-passenger-trips'
        ];

        const tables: { [key: string]: dynamodb.ITable } = {};
        for (const tableName of tableNames) {
            tables[tableName] = dynamodb.Table.fromTableName(this, `Table_${tableName}`, tableName);
        }

        // --- 4. Python Backend Lambdas ---
        const backendCodePath = process.env.BACKEND_CODE_PATH || path.join(__dirname, '../../backend');

        const createLambda = (id: string, handler: string, env: { [key: string]: string } = {}, timeout: number = 15) => {
            const fn = new lambda.Function(this, id, {
                runtime: lambda.Runtime.PYTHON_3_12,
                handler: handler,
                code: lambda.Code.fromAsset(backendCodePath),
                timeout: cdk.Duration.seconds(timeout),
                environment: {
                    SECRET_NAME: apiSecrets.secretName,
                    INVOICE_BUCKET: invoicesBucket.bucketName,
                    FROM_EMAIL: fromEmail,
                    RESEND_API_KEY: resendApiKey,
                    AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
                    ...env
                },
                memorySize: 256
            });

            apiSecrets.grantRead(fn);
            for (const table of Object.values(tables)) {
                table.grantReadWriteData(fn);
            }
            invoicesBucket.grantReadWrite(fn);

            fn.addToRolePolicy(new iam.PolicyStatement({
                actions: [
                    'geo:*',
                    's3:*',
                    'cognito-idp:*',
                    'execute-api:ManageConnections',
                    'secretsmanager:GetSecretValue'
                ],
                resources: ['*']
            }));

            return fn;
        };

        // --- Contact Form Lambda (Node.js - existing) ---
        const contactLambda = new lambda.Function(this, 'ContactFormHandler', {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/contact-form')),
            environment: { SECRET_NAME: apiSecrets.secretName },
            timeout: cdk.Duration.seconds(10),
        });
        apiSecrets.grantRead(contactLambda);

        // --- Python Backend Lambdas ---
        const lambdas = {
            'signup': createLambda('FnSignup', 'lambda/auth/signup.lambda_handler'),
            'login': createLambda('FnLogin', 'lambda/auth/login.lambda_handler'),
            'getProfile': createLambda('FnGetProfile', 'lambda/users/get_profile.lambda_handler'),
            'updateProfile': createLambda('FnUpdateProfile', 'lambda/users/update_profile.lambda_handler'),
            'busesCrud': createLambda('FnBusesCrud', 'lambda/buses/crud.lambda_handler'),
            'routesCrud': createLambda('FnRoutesCrud', 'lambda/routes/crud.lambda_handler'),
            'schedulesCrud': createLambda('FnSchedulesCrud', 'lambda/schedules/crud.lambda_handler'),
            'tripsCrud': createLambda('FnTripsCrud', 'lambda/trips/crud.lambda_handler'),
            'paymentsCrud': createLambda('FnPaymentsCrud', 'lambda/payments/crud.lambda_handler'),
            'subscriptionsCrud': createLambda('FnSubscriptionsCrud', 'lambda/subscriptions/crud.lambda_handler'),
            'ticketsCrud': createLambda('FnTicketsCrud', 'lambda/tickets/crud.lambda_handler'),
            'nfcCrud': createLambda('FnNfcCrud', 'lambda/nfc/crud.lambda_handler'),
            'adminUsers': createLambda('FnAdminUsers', 'lambda/admin/users.lambda_handler'),
            'adminReports': createLambda('FnAdminReports', 'lambda/admin/reports.lambda_handler'),
            'wsConnect': createLambda('FnWsConnect', 'lambda/websocket/connect.lambda_handler'),
            'wsDisconnect': createLambda('FnWsDisconnect', 'lambda/websocket/disconnect.lambda_handler'),
            'wsSubscribe': createLambda('FnWsSubscribe', 'lambda/websocket/subscribe.lambda_handler'),
            'wsBroadcast': createLambda('FnWsBroadcast', 'lambda/websocket/broadcast.lambda_handler'),
            'gpsIngest': createLambda('FnGpsIngest', 'lambda/gps/ingest.lambda_handler'),
            'contactForm': contactLambda,
            // --- NEW: Wallet, History, Invoices ---
            'walletCrud': createLambda('FnWalletCrud', 'lambda/wallet/crud.handler'),
            'tripsHistory': createLambda('FnTripsHistory', 'lambda/trips/history.handler'),
            'paymentsHistory': createLambda('FnPaymentsHistory', 'lambda/payments/history.handler'),
            'subscriptionReminder': createLambda('FnSubscriptionReminder', 'lambda/subscriptions/reminder.handler', {}, 60),
        };

        // --- 5. EventBridge Rule for Daily Subscription Reminders ---
        const reminderRule = new events.Rule(this, 'SubscriptionReminderRule', {
            schedule: events.Schedule.cron({ minute: '0', hour: '13' }), // 8h Haiti = 13h UTC
            description: 'Trigger subscription reminder emails daily at 8am Haiti time',
        });
        reminderRule.addTarget(new targets.LambdaFunction(lambdas.subscriptionReminder));

        // --- 6. API Gateway (HTTP API) ---
        const httpApi = new apigwv2.HttpApi(this, 'LimajsMotorsApi', {
            corsPreflight: {
                allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
                allowMethods: [apigwv2.CorsHttpMethod.ANY],
                allowOrigins: ['*'],
            },
        });

        const addRoute = (path: string, method: apigwv2.HttpMethod, fn: lambda.Function) => {
            httpApi.addRoutes({
                path,
                methods: [method],
                integration: new apigwv2_integrations.HttpLambdaIntegration(`${id}_${path.replace(/\//g, '')}_${method}`, fn)
            });
        };

        // Auth
        addRoute('/auth/signup', apigwv2.HttpMethod.POST, lambdas.signup);
        addRoute('/auth/login', apigwv2.HttpMethod.POST, lambdas.login);

        // Users
        addRoute('/users/me', apigwv2.HttpMethod.GET, lambdas.getProfile);
        addRoute('/users/me', apigwv2.HttpMethod.PUT, lambdas.updateProfile);
        addRoute('/users/me/photo', apigwv2.HttpMethod.POST, lambdas.updateProfile);

        // Core Business
        addRoute('/buses', apigwv2.HttpMethod.ANY, lambdas.busesCrud);
        addRoute('/buses/{id}', apigwv2.HttpMethod.ANY, lambdas.busesCrud);
        addRoute('/routes', apigwv2.HttpMethod.ANY, lambdas.routesCrud);
        addRoute('/routes/{id}', apigwv2.HttpMethod.ANY, lambdas.routesCrud);
        addRoute('/schedules', apigwv2.HttpMethod.ANY, lambdas.schedulesCrud);
        addRoute('/schedules/{id}', apigwv2.HttpMethod.ANY, lambdas.schedulesCrud);

        // Trips (Driver App)
        addRoute('/trips/start', apigwv2.HttpMethod.POST, lambdas.tripsCrud);
        addRoute('/trips/end', apigwv2.HttpMethod.POST, lambdas.tripsCrud);
        addRoute('/trips/board', apigwv2.HttpMethod.POST, lambdas.tripsCrud);
        addRoute('/trips/alight', apigwv2.HttpMethod.POST, lambdas.tripsCrud);
        addRoute('/trips/current/passengers', apigwv2.HttpMethod.GET, lambdas.tripsCrud);
        // NEW: Trip history for passengers
        addRoute('/trips/history', apigwv2.HttpMethod.GET, lambdas.tripsHistory);

        // GPS (Driver App)
        addRoute('/gps/batch', apigwv2.HttpMethod.POST, lambdas.gpsIngest);

        // Subscriptions & Payments
        addRoute('/subscriptions/types', apigwv2.HttpMethod.GET, lambdas.subscriptionsCrud);
        addRoute('/subscriptions', apigwv2.HttpMethod.POST, lambdas.subscriptionsCrud);
        addRoute('/subscriptions/active', apigwv2.HttpMethod.GET, lambdas.subscriptionsCrud);
        addRoute('/payments/presigned-url', apigwv2.HttpMethod.POST, lambdas.paymentsCrud);
        addRoute('/payments/upload', apigwv2.HttpMethod.POST, lambdas.paymentsCrud);
        // NEW: Payment history
        addRoute('/payments/history', apigwv2.HttpMethod.GET, lambdas.paymentsHistory);

        // NEW: Wallet endpoints
        addRoute('/wallet/balance', apigwv2.HttpMethod.GET, lambdas.walletCrud);
        addRoute('/wallet/transactions', apigwv2.HttpMethod.GET, lambdas.walletCrud);
        addRoute('/wallet/recharge', apigwv2.HttpMethod.POST, lambdas.walletCrud);
        addRoute('/wallet/pay', apigwv2.HttpMethod.POST, lambdas.walletCrud);

        // Tickets
        addRoute('/tickets/generate', apigwv2.HttpMethod.POST, lambdas.ticketsCrud);
        addRoute('/tickets/my', apigwv2.HttpMethod.GET, lambdas.ticketsCrud);
        addRoute('/tickets/validate', apigwv2.HttpMethod.POST, lambdas.ticketsCrud);
        addRoute('/tickets/{id}', apigwv2.HttpMethod.GET, lambdas.ticketsCrud);

        // NFC
        addRoute('/nfc/my-card', apigwv2.HttpMethod.GET, lambdas.nfcCrud);
        addRoute('/nfc/validate', apigwv2.HttpMethod.POST, lambdas.nfcCrud);
        addRoute('/nfc/recharge', apigwv2.HttpMethod.POST, lambdas.nfcCrud);

        // Admin
        addRoute('/admin/users', apigwv2.HttpMethod.GET, lambdas.adminUsers);
        addRoute('/admin/reports/dashboard', apigwv2.HttpMethod.GET, lambdas.adminReports);

        // Contact Form
        addRoute('/contact', apigwv2.HttpMethod.POST, lambdas.contactForm);

        // --- 7. Outputs ---
        new cdk.CfnOutput(this, 'CloudFrontURL', { value: `https://${distribution.distributionDomainName}` });
        new cdk.CfnOutput(this, 'ApiGatewayURL', { value: httpApi.url! });
        new cdk.CfnOutput(this, 'S3BucketName', { value: websiteBucket.bucketName });
        new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
        new cdk.CfnOutput(this, 'SecretName', { value: apiSecrets.secretName });
        new cdk.CfnOutput(this, 'InvoicesBucketName', { value: invoicesBucket.bucketName });
    }
}


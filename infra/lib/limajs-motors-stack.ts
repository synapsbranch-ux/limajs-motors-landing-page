import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
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
        // Email configuration
        const resendApiKey = process.env.RESEND_API_KEY || '';
        const adminEmails = process.env.ADMIN_EMAILS || 'limajsmotorssa@gmail.com,mainoffice@limajs.com';
        const fromEmail = process.env.FROM_EMAIL || 'contact@limajs.com';
        const devMail = process.env.DEV_MAIL || '';

        // S3 Configuration
        const bucketName = process.env.TARGET_BUCKET_NAME;
        const storageBucket = process.env.AWS_S3_BUCKET_NAME || 'limajs-storage-513729761883';

        // Cognito Configuration
        const cognitoUserPoolId = process.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_78ANoaZy1';
        const cognitoClientId = process.env.VITE_COGNITO_CLIENT_ID || '6vilq0et60jovueorl2p0o6gcp';

        // WebSocket Configuration
        const websocketUrl = process.env.VITE_WEBSOCKET_URL || 'wss://hvt51zyjsc.execute-api.us-east-1.amazonaws.com/production';
        const websocketApiId = process.env.WEBSOCKET_API_ID || 'hvt51zyjsc';

        // AWS Location Configuration
        const locationMapName = process.env.AWS_LOCATION_MAP_NAME || 'limajs-map-standard';
        const locationTrackerName = process.env.AWS_LOCATION_TRACKER_NAME || 'limajs-bus-tracker';

        // DynamoDB Table Names
        const tableUsers = process.env.TABLE_USERS || 'limajs-users';
        const tableBuses = process.env.TABLE_BUSES || 'limajs-buses';
        const tableRoutes = process.env.TABLE_ROUTES || 'limajs-routes';
        const tableSchedules = process.env.TABLE_SCHEDULES || 'limajs-schedules';
        const tableSubscriptions = process.env.TABLE_SUBSCRIPTIONS || 'limajs-subscriptions';
        const tablePayments = process.env.TABLE_PAYMENTS || 'limajs-payments';
        const tableTickets = process.env.TABLE_TICKETS || 'limajs-tickets';
        const tableNfcCards = process.env.TABLE_NFC_CARDS || 'limajs-nfc-cards';
        const tableTrips = process.env.TABLE_TRIPS || 'limajs-trips';
        const tableGpsPositions = process.env.TABLE_GPS_POSITIONS || 'limajs-gps-positions';
        const tableConnections = process.env.TABLE_CONNECTIONS || 'limajs-websocket-connections';

        // --- 1. S3 Frontend ---
        // NOTE: Do NOT change removalPolicy or autoDeleteObjects on existing bucket
        // CloudFormation will try to replace the bucket which causes deployment failure
        const websiteBucket = new s3.Bucket(this, 'LimajsMotorsFrontendBucket', {
            // bucketName is intentionally omitted to use CDK-generated name
            // This maintains consistency with the existing deployed bucket
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

        // --- 2. Secrets Manager (All configuration values) ---
        const apiSecrets = new secretsmanager.Secret(this, 'LimajsbackendSecrets', {
            secretName: 'limajs/backend/production',
            description: 'Configuration for Limajs Backend',
            secretStringValue: cdk.SecretValue.unsafePlainText(JSON.stringify({
                // Email
                RESEND_API_KEY: resendApiKey,
                ADMIN_EMAILS: adminEmails,
                FROM_EMAIL: fromEmail,
                DEV_MAIL: devMail,
                // Cognito
                COGNITO_USER_POOL_ID: cognitoUserPoolId,
                COGNITO_CLIENT_ID: cognitoClientId,
                // WebSocket
                WEBSOCKET_URL: websocketUrl,
                WEBSOCKET_API_ID: websocketApiId,
                // AWS Location
                AWS_LOCATION_MAP_NAME: locationMapName,
                AWS_LOCATION_TRACKER_NAME: locationTrackerName,
                // S3
                AWS_S3_BUCKET_NAME: storageBucket,
                // DynamoDB Tables
                TABLE_USERS: tableUsers,
                TABLE_BUSES: tableBuses,
                TABLE_ROUTES: tableRoutes,
                TABLE_SCHEDULES: tableSchedules,
                TABLE_SUBSCRIPTIONS: tableSubscriptions,
                TABLE_PAYMENTS: tablePayments,
                TABLE_TICKETS: tableTickets,
                TABLE_NFC_CARDS: tableNfcCards,
                TABLE_TRIPS: tableTrips,
                TABLE_GPS_POSITIONS: tableGpsPositions,
                TABLE_CONNECTIONS: tableConnections,
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
                    // Cognito configuration for auth lambdas
                    COGNITO_USER_POOL_ID: cognitoUserPoolId,
                    COGNITO_CLIENT_ID: cognitoClientId,
                    VITE_COGNITO_CLIENT_ID: cognitoClientId, // Alias for backwards compatibility
                    // WebSocket configuration
                    WEBSOCKET_API_ID: websocketApiId,
                    // AWS Location
                    AWS_LOCATION_TRACKER_NAME: locationTrackerName,
                    AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
                    ...env
                },
                memorySize: 256
            });

            apiSecrets.grantRead(fn);
            for (const table of Object.values(tables)) {
                table.grantReadWriteData(fn);
                fn.addToRolePolicy(new iam.PolicyStatement({
                    actions: ['dynamodb:Query', 'dynamodb:Scan'],
                    resources: [`${table.tableArn}/index/*`]
                }));
            }
            invoicesBucket.grantReadWrite(fn);

            fn.addToRolePolicy(new iam.PolicyStatement({
                actions: [
                    'geo:BatchUpdateDevicePosition',
                    'geo:GetDevicePosition',
                    'geo:GetDevicePositionHistory'
                ],
                resources: [`arn:aws:geo:us-east-1:513729761883:tracker/${locationTrackerName}`]
            }));

            fn.addToRolePolicy(new iam.PolicyStatement({
                actions: [
                    'cognito-idp:AdminGetUser',
                    'cognito-idp:AdminCreateUser',
                    'cognito-idp:AdminUpdateUserAttributes',
                    'cognito-idp:InitiateAuth'
                ],
                resources: [`arn:aws:cognito-idp:us-east-1:513729761883:userpool/${cognitoUserPoolId}`]
            }));

            fn.addToRolePolicy(new iam.PolicyStatement({
                actions: ['execute-api:ManageConnections'],
                resources: [`arn:aws:execute-api:us-east-1:513729761883:${websocketApiId}/*`]
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

        // --- 6. API Gateway (HTTP API) with Cognito JWT Authorizer ---
        const httpApi = new apigwv2.HttpApi(this, 'LimajsMotorsApi', {
            corsPreflight: {
                allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
                allowMethods: [apigwv2.CorsHttpMethod.ANY],
                allowOrigins: ['*'],
            },
        });

        // JWT Authorizer for Cognito User Pool
        const jwtAuthorizer = new HttpJwtAuthorizer('CognitoAuthorizer',
            `https://cognito-idp.us-east-1.amazonaws.com/${cognitoUserPoolId}`,
            {
                jwtAudience: [cognitoClientId],
            }
        );

        // Public routes (no auth)
        const addPublicRoute = (path: string, method: apigwv2.HttpMethod, fn: lambda.Function) => {
            httpApi.addRoutes({
                path,
                methods: [method],
                integration: new apigwv2_integrations.HttpLambdaIntegration(`${id}_${path.replace(/\//g, '')}_${method}`, fn)
            });
        };

        // Protected routes (require JWT)
        const addProtectedRoute = (path: string, method: apigwv2.HttpMethod, fn: lambda.Function) => {
            httpApi.addRoutes({
                path,
                methods: [method],
                integration: new apigwv2_integrations.HttpLambdaIntegration(`${id}_${path.replace(/\//g, '')}_${method}_auth`, fn),
                authorizer: jwtAuthorizer
            });
        };

        // Auth (Public - no auth required)
        addPublicRoute('/auth/signup', apigwv2.HttpMethod.POST, lambdas.signup);
        addPublicRoute('/auth/login', apigwv2.HttpMethod.POST, lambdas.login);

        // Users (Protected)
        addProtectedRoute('/users/me', apigwv2.HttpMethod.GET, lambdas.getProfile);
        addProtectedRoute('/users/me', apigwv2.HttpMethod.PUT, lambdas.updateProfile);
        addProtectedRoute('/users/me/photo', apigwv2.HttpMethod.POST, lambdas.updateProfile);

        // Core Business (Protected)
        addProtectedRoute('/buses', apigwv2.HttpMethod.ANY, lambdas.busesCrud);
        addProtectedRoute('/buses/{id}', apigwv2.HttpMethod.ANY, lambdas.busesCrud);
        addProtectedRoute('/routes', apigwv2.HttpMethod.ANY, lambdas.routesCrud);
        addProtectedRoute('/routes/{id}', apigwv2.HttpMethod.ANY, lambdas.routesCrud);
        addProtectedRoute('/schedules', apigwv2.HttpMethod.ANY, lambdas.schedulesCrud);
        addProtectedRoute('/schedules/{id}', apigwv2.HttpMethod.ANY, lambdas.schedulesCrud);

        // Trips (Driver App - Protected)
        addProtectedRoute('/trips/start', apigwv2.HttpMethod.POST, lambdas.tripsCrud);
        addProtectedRoute('/trips/end', apigwv2.HttpMethod.POST, lambdas.tripsCrud);
        addProtectedRoute('/trips/board', apigwv2.HttpMethod.POST, lambdas.tripsCrud);
        addProtectedRoute('/trips/alight', apigwv2.HttpMethod.POST, lambdas.tripsCrud);
        addProtectedRoute('/trips/current/passengers', apigwv2.HttpMethod.GET, lambdas.tripsCrud);
        addProtectedRoute('/trips/history', apigwv2.HttpMethod.GET, lambdas.tripsHistory);

        // GPS (Driver App - Protected)
        addProtectedRoute('/gps/batch', apigwv2.HttpMethod.POST, lambdas.gpsIngest);

        // Subscriptions & Payments
        addPublicRoute('/subscriptions/types', apigwv2.HttpMethod.GET, lambdas.subscriptionsCrud);  // Public: view plans
        addProtectedRoute('/subscriptions', apigwv2.HttpMethod.POST, lambdas.subscriptionsCrud);
        addProtectedRoute('/subscriptions/active', apigwv2.HttpMethod.GET, lambdas.subscriptionsCrud);
        addProtectedRoute('/payments/presigned-url', apigwv2.HttpMethod.POST, lambdas.paymentsCrud);
        addProtectedRoute('/payments/upload', apigwv2.HttpMethod.POST, lambdas.paymentsCrud);
        addProtectedRoute('/payments/history', apigwv2.HttpMethod.GET, lambdas.paymentsHistory);

        // Wallet (Protected)
        addProtectedRoute('/wallet/balance', apigwv2.HttpMethod.GET, lambdas.walletCrud);
        addProtectedRoute('/wallet/transactions', apigwv2.HttpMethod.GET, lambdas.walletCrud);
        addProtectedRoute('/wallet/recharge', apigwv2.HttpMethod.POST, lambdas.walletCrud);
        addProtectedRoute('/wallet/pay', apigwv2.HttpMethod.POST, lambdas.walletCrud);

        // Tickets (Protected)
        addProtectedRoute('/tickets/generate', apigwv2.HttpMethod.POST, lambdas.ticketsCrud);
        addProtectedRoute('/tickets/my', apigwv2.HttpMethod.GET, lambdas.ticketsCrud);
        addProtectedRoute('/tickets/validate', apigwv2.HttpMethod.POST, lambdas.ticketsCrud);
        addProtectedRoute('/tickets/{id}', apigwv2.HttpMethod.GET, lambdas.ticketsCrud);

        // NFC (Protected)
        addProtectedRoute('/nfc/my-card', apigwv2.HttpMethod.GET, lambdas.nfcCrud);
        addProtectedRoute('/nfc/validate', apigwv2.HttpMethod.POST, lambdas.nfcCrud);
        addProtectedRoute('/nfc/recharge', apigwv2.HttpMethod.POST, lambdas.nfcCrud);

        // Admin (Protected - requires admin role)
        addProtectedRoute('/admin/users', apigwv2.HttpMethod.GET, lambdas.adminUsers);
        addProtectedRoute('/admin/reports/dashboard', apigwv2.HttpMethod.GET, lambdas.adminReports);

        // Contact Form (Public)
        addPublicRoute('/contact', apigwv2.HttpMethod.POST, lambdas.contactForm);

        // --- 7. Outputs ---
        new cdk.CfnOutput(this, 'CloudFrontURL', { value: `https://${distribution.distributionDomainName}` });
        new cdk.CfnOutput(this, 'ApiGatewayURL', { value: httpApi.url! });
        new cdk.CfnOutput(this, 'S3BucketName', { value: websiteBucket.bucketName });
        new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
        new cdk.CfnOutput(this, 'SecretName', { value: apiSecrets.secretName });
        new cdk.CfnOutput(this, 'InvoicesBucketName', { value: invoicesBucket.bucketName });
    }
}


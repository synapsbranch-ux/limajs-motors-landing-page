#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LimajsMotorsStack } from '../lib/limajs-motors-stack';

const app = new cdk.App();
new LimajsMotorsStack(app, 'LimajsMotorsStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
    },
});

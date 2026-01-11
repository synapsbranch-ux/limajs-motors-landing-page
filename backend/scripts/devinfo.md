# 🚀 LimaJS Motors - Dev Info

> Généré le 2026-01-10 21:51:36

---

## 📡 Endpoints & URLs

| Resource | URL |
|----------|-----|
| **API Gateway** | `https://bekioazd5d.execute-api.us-east-1.amazonaws.com/` |
| **CloudFront** | `https://dfs192t4oj7l6.cloudfront.net` |
| **S3 Bucket** | `limajsmotorsstack-limajsmotorsfrontendbucketdd54cd-ksskae8irblk` |
| **CloudFront Dist ID** | `E1Q1BZNJDUG1VU` |
| **Secret Name** | `limajs/backend/production` |

---

## 📊 Stack Status

| Info | Valeur |
|------|--------|
| Stack Name | `LimajsMotorsStack` |
| Status | `UPDATE_COMPLETE` |
| Last Updated | `2026-01-11 02:32:30.414000+00:00` |

---

## 🔗 Routes Backend

### Auth
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/auth/signup`
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/auth/login`

### Users
- `GET https://bekioazd5d.execute-api.us-east-1.amazonaws.com/users/me`
- `PUT https://bekioazd5d.execute-api.us-east-1.amazonaws.com/users/me`
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/users/me/photo`

### Buses
- `GET/POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/buses`
- `GET/PUT/DELETE https://bekioazd5d.execute-api.us-east-1.amazonaws.com/buses/{id}`

### Routes
- `GET/POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/routes`
- `GET/PUT/DELETE https://bekioazd5d.execute-api.us-east-1.amazonaws.com/routes/{id}`

### Schedules
- `GET/POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/schedules`

### Trips (Driver App)
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/trips/start`
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/trips/end`
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/trips/board`
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/trips/alight`
- `GET https://bekioazd5d.execute-api.us-east-1.amazonaws.com/trips/current/passengers`

### GPS
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/gps/batch`

### Subscriptions
- `GET https://bekioazd5d.execute-api.us-east-1.amazonaws.com/subscriptions/types`
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/subscriptions`
- `GET https://bekioazd5d.execute-api.us-east-1.amazonaws.com/subscriptions/active`

### Payments
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/payments/presigned-url`
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/payments/upload`

### Admin
- `GET https://bekioazd5d.execute-api.us-east-1.amazonaws.com/admin/users`
- `GET https://bekioazd5d.execute-api.us-east-1.amazonaws.com/admin/reports/dashboard`

### Contact
- `POST https://bekioazd5d.execute-api.us-east-1.amazonaws.com/contact`

---

## 🗄️ DynamoDB Tables (11)

| Table Name |
|------------|
| `limajs-buses` |
| `limajs-gps-positions` |
| `limajs-nfc-cards` |
| `limajs-payments` |
| `limajs-routes` |
| `limajs-schedules` |
| `limajs-subscriptions` |
| `limajs-tickets` |
| `limajs-trips` |
| `limajs-users` |
| `limajs-websocket-connections` |

---

## ⚡ Lambda Functions (21)

| Function | Runtime | Memory | Timeout |
|----------|---------|--------|---------|
| `LimajsMotorsStack-FnSignupF8E0AE95-gOCCFdkkmOq0` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnGetProfile0071A60F-kGzB87DIP8Cq` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-CustomS3AutoDeleteObjectsCustomR-bqaEHtMPZxdX` | nodejs20.x | 128MB | 900s |
| `LimajsMotorsStack-ContactFormHandler08EF5FA6-snv7BAlRmRsA` | nodejs22.x | 128MB | 10s |
| `LimajsMotorsStack-FnTripsCrud6E3D66B8-uyWAJrY5DPL6` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnWsBroadcastB703D738-Uwe5gagsxPFi` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnPaymentsCrud647DFF56-Wxzod5buLufp` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnUpdateProfile93698528-jagzZbMM6vPD` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnWsDisconnect80458154-IUaUphbck7HT` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnSchedulesCrudAD501E14-s1tVpZoN0ReZ` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnNfcCrudD70909E6-VDpqOTH9Bb55` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnLoginFDC457BC-yTaxd1qTAg3f` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnSubscriptionsCrudE3C4EE06-UcLS8irDpPW3` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnTicketsCrudCDED76E9-zbf6NXudP8eO` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnWsConnect580F2FC6-eR004EEiFtY0` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnAdminUsersE76D1D53-UqqxJr0lVQ5A` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnWsSubscribe3695D752-sbdmBhXONvz6` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnAdminReportsF3E83F10-zAsUNBvce9o2` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnGpsIngest5CC69D57-omXu3ON7OvMt` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnRoutesCrud0D4A3776-qAiCTKAnz16r` | python3.12 | 256MB | 15s |
| `LimajsMotorsStack-FnBusesCrud078EF09B-V2mcmQVHrBjI` | python3.12 | 256MB | 15s |

---

## 🧪 Test Commands

```bash
# Test API health (buses endpoint)
curl https://bekioazd5d.execute-api.us-east-1.amazonaws.com/buses

# Test with authorization
curl -H "Authorization: Bearer YOUR_TOKEN" https://bekioazd5d.execute-api.us-east-1.amazonaws.com/users/me
```

---

## 🔧 Useful AWS CLI Commands

```bash
# View stack outputs
aws cloudformation describe-stacks --stack-name LimajsMotorsStack --query "Stacks[0].Outputs"

# View Lambda logs
aws logs tail /aws/lambda/LimajsMotorsStack-FnLogin --follow

# Get secret value
aws secretsmanager get-secret-value --secret-id limajs/backend/production --query SecretString --output text
```

# LimaJS Motors - API Documentation

> **Base URL**: `https://bekioazd5d.execute-api.us-east-1.amazonaws.com/`
> **Version**: 1.0.0
> **Last Updated**: 2026-01-10

---

## 📋 Overview

Cette API REST alimente les applications LimaJS Motors :
- **App Passager** : Réservation, abonnements, suivi GPS
- **App Chauffeur** : Gestion des trajets, embarquement passagers
- **Dashboard Admin** : Gestion flotte, utilisateurs, finances

---

## 🔐 Authentication

Toutes les routes protégées nécessitent un header `Authorization`:

```
Authorization: Bearer <JWT_TOKEN>
```

Le token est obtenu via `/auth/login`.

---

## 📡 Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Créer un compte | ❌ |
| POST | `/auth/login` | Se connecter | ❌ |

#### POST /auth/signup

Crée un nouveau compte utilisateur.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+509 1234 5678",
  "role": "passenger"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "user-xxx",
    "email": "user@example.com",
    "message": "Account created. Please verify your email."
  }
}
```

#### POST /auth/login

Authentifie un utilisateur.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": "user-xxx",
      "email": "user@example.com",
      "firstName": "Jean",
      "role": "passenger"
    }
  }
}
```

---

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Mon profil | ✅ |
| PUT | `/users/me` | Modifier profil | ✅ |
| POST | `/users/me/photo` | Upload photo | ✅ |

#### GET /users/me

Retourne le profil de l'utilisateur connecté.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "passenger-001",
    "email": "client1@gmail.com",
    "firstName": "Jacques",
    "lastName": "Bonhomme",
    "phone": "+509 4111 1111",
    "role": "passenger",
    "createdAt": "2024-11-10T..."
  }
}
```

#### PUT /users/me

Met à jour le profil.

**Request Body:**
```json
{
  "firstName": "Jacques",
  "lastName": "Bonhomme-Updated",
  "phone": "+509 4111 9999"
}
```

---

### Buses

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/buses` | Liste des bus | ✅ |
| POST | `/buses` | Créer un bus | 🔒 Admin |
| GET | `/buses/{id}` | Détails d'un bus | ✅ |
| PUT | `/buses/{id}` | Modifier un bus | 🔒 Admin |
| DELETE | `/buses/{id}` | Supprimer un bus | 🔒 Admin |

#### GET /buses

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "busId": "bus-001",
      "plateNumber": "AA-1234",
      "model": "Mercedes Sprinter 519",
      "capacity": 22,
      "status": "active",
      "currentDriverId": "driver-001"
    }
  ]
}
```

---

### Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/routes` | Liste des lignes | ✅ |
| POST | `/routes` | Créer une ligne | 🔒 Admin |
| GET | `/routes/{id}` | Détails + arrêts | ✅ |
| PUT | `/routes/{id}` | Modifier | 🔒 Admin |

#### GET /routes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "routeId": "route-001",
      "name": "Ligne A - Centre-Ville Express",
      "shortCode": "A",
      "color": "#2563EB",
      "stops": [
        {"stopId": "stop-a1", "name": "Gare Centrale", "lat": 18.5429, "lng": -72.3388, "order": 1},
        {"stopId": "stop-a2", "name": "Place du Marché", "lat": 18.545, "lng": -72.34, "order": 2}
      ],
      "estimatedDuration": 35,
      "distance": 8.5
    }
  ]
}
```

---

### Schedules

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/schedules` | Horaires | ✅ |
| GET | `/schedules?routeId=xxx` | Horaires d'une ligne | ✅ |

#### GET /schedules

**Query Params:**
- `routeId` (optional): Filtrer par ligne

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "scheduleId": "sched-001-01",
      "routeId": "route-001",
      "departureTime": "06:00",
      "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "assignedBusId": "bus-001",
      "status": "active"
    }
  ]
}
```

---

### Trips (Driver App)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/trips/start` | Démarrer un trajet | 🚌 Driver |
| POST | `/trips/end` | Terminer un trajet | 🚌 Driver |
| POST | `/trips/board` | Embarquer passager | 🚌 Driver |
| POST | `/trips/alight` | Débarquer passager | 🚌 Driver |
| GET | `/trips/current/passengers` | Passagers à bord | 🚌 Driver |

#### POST /trips/start

Démarre un nouveau trajet.

**Request Body:**
```json
{
  "routeId": "route-001",
  "busId": "bus-001",
  "scheduleId": "sched-001-05"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "tripId": "trip-xxx",
    "status": "in_progress",
    "startedAt": "2026-01-10T12:00:00Z"
  }
}
```

#### POST /trips/board

Enregistre l'embarquement d'un passager (scan NFC/QR).

**Request Body:**
```json
{
  "tripId": "trip-xxx",
  "ticketId": "ticket-yyy",
  "stopId": "stop-a1"
}
```

---

### GPS

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/gps/batch` | Envoyer positions | 🚌 Driver |

#### POST /gps/batch

Envoie un batch de positions GPS.

**Request Body:**
```json
{
  "busId": "bus-001",
  "tripId": "trip-xxx",
  "positions": [
    {"lat": 18.5429, "lng": -72.3388, "timestamp": "2026-01-10T12:00:00Z", "speed": 25},
    {"lat": 18.5435, "lng": -72.3395, "timestamp": "2026-01-10T12:00:05Z", "speed": 30}
  ]
}
```

---

### Subscriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/subscriptions/types` | Types disponibles | ❌ |
| POST | `/subscriptions` | Souscrire | ✅ |
| GET | `/subscriptions/active` | Mon abonnement | ✅ |

#### GET /subscriptions/types

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "daily",
      "name": "Pass Journalier",
      "price": 150,
      "currency": "HTG",
      "duration": 1,
      "durationType": "days"
    },
    {
      "id": "weekly",
      "name": "Pass Hebdomadaire",
      "price": 750,
      "currency": "HTG",
      "duration": 7
    },
    {
      "id": "monthly",
      "name": "Pass Mensuel",
      "price": 2500,
      "currency": "HTG",
      "duration": 30
    }
  ]
}
```

---

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/presigned-url` | URL upload preuve | ✅ |
| POST | `/payments/upload` | Soumettre paiement | ✅ |

#### POST /payments/presigned-url

Obtient une URL pré-signée pour uploader la preuve de paiement.

**Request Body:**
```json
{
  "subscriptionType": "monthly",
  "fileType": "image/jpeg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "paymentId": "payment-xxx",
    "expiresAt": "2026-01-10T13:00:00Z"
  }
}
```

---

### Tickets (QR Code)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/tickets/generate` | Générer un ticket QR | ✅ |
| GET | `/tickets/my` | Mes tickets actifs | ✅ |
| POST | `/tickets/validate` | Valider un ticket (scan) | 🚌 Driver |
| GET | `/tickets/{id}` | Détails d'un ticket | ✅ |

#### POST /tickets/generate

Génère un ticket de transport avec QR code.

**Request Body:**
```json
{
  "subscriptionId": "sub-xxx",
  "routeId": "route-001"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "ticketId": "ticket-xxx",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "token": "abc123xyz789",
    "expiresAt": "2026-01-11T23:59:59Z",
    "routeId": "route-001",
    "status": "active"
  }
}
```

#### GET /tickets/my

Retourne les tickets actifs de l'utilisateur.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "ticketId": "ticket-001",
      "routeId": "route-001",
      "routeName": "Ligne A - Centre-Ville Express",
      "status": "active",
      "expiresAt": "2026-01-11T23:59:59Z",
      "usedAt": null
    }
  ]
}
```

#### POST /tickets/validate

Valide un ticket scanné par le chauffeur.

**Request Body:**
```json
{
  "token": "abc123xyz789",
  "tripId": "trip-xxx",
  "stopId": "stop-a1"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "ticketId": "ticket-001",
    "passenger": {
      "firstName": "Jacques",
      "lastName": "Bonhomme"
    },
    "message": "Ticket validé avec succès"
  }
}
```

**Response (400 - Invalid):**
```json
{
  "success": false,
  "error": {
    "code": "TICKET_INVALID",
    "message": "Ticket expiré ou déjà utilisé"
  }
}
```

---

### NFC Cards

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/nfc/my-card` | Ma carte NFC | ✅ |
| POST | `/nfc/validate` | Valider carte NFC | 🚌 Driver |
| POST | `/nfc/recharge` | Recharger carte | ✅ |

#### GET /nfc/my-card

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cardId": "nfc-001",
    "cardNumber": "LMJ-2024-0001",
    "balance": 500,
    "currency": "HTG",
    "status": "active",
    "expiresAt": "2027-01-10T00:00:00Z"
  }
}
```

#### POST /nfc/validate

Valide une carte NFC scannée.

**Request Body:**
```json
{
  "nfcUid": "04:A3:2B:8C:9F:00",
  "tripId": "trip-xxx"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "cardNumber": "LMJ-2024-0001",
    "balance": 450,
    "fareDeducted": 50,
    "passenger": "Jacques B."
  }
}
```

---

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/users` | Liste utilisateurs | 🔒 Admin |
| GET | `/admin/reports/dashboard` | KPIs dashboard | 🔒 Admin |

#### GET /admin/reports/dashboard

**Response (200):**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalUsers": 850,
      "activeSubscriptions": 320,
      "tripsToday": 45,
      "revenueThisMonth": 125000
    },
    "recentTrips": [...],
    "pendingPayments": 5
  }
}
```

---

### Contact

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/contact` | Formulaire contact | ❌ |

#### POST /contact

**Request Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "message": "Question about your service..."
}
```

---

### Wallet (Crédit)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/wallet/balance` | Solde actuel | ✅ |
| GET | `/wallet/transactions` | Historique transactions | ✅ |
| POST | `/wallet/recharge` | Demander recharge | ✅ |
| POST | `/wallet/pay` | Payer avec wallet | ✅ |

#### GET /wallet/balance

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 1500,
    "currency": "HTG",
    "lastUpdate": "2026-01-10T..."
  }
}
```

#### POST /wallet/recharge

**Request Body:**
```json
{
  "amount": 500
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "paymentId": "recharge-xxx",
    "uploadUrl": "https://s3...",
    "message": "Veuillez uploader votre preuve de paiement"
  }
}
```

#### POST /wallet/pay

**Request Body:**
```json
{
  "amount": 2500,
  "description": "Pass Mensuel",
  "relatedId": "subscription-xxx"
}
```

---

### Historiques

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/trips/history` | Historique trajets | ✅ |
| GET | `/payments/history` | Historique paiements | ✅ |

#### GET /trips/history

**Query Params:** `limit`, `startDate`, `endDate`

**Response (200):**
```json
{
  "data": {
    "trips": [{
      "tripId": "trip-001",
      "date": "2026-01-10",
      "routeName": "Ligne A",
      "boardedStop": "Gare Centrale",
      "alightedStop": "Terminal Nord",
      "fare": 50,
      "paymentMethod": "wallet"
    }]
  }
}
```

#### GET /payments/history

**Response (200):**
```json
{
  "data": {
    "payments": [{
      "paymentId": "pay-001",
      "date": "2026-01-05",
      "amount": 2500,
      "type": "subscription",
      "description": "Pass Mensuel",
      "status": "approved",
      "invoiceUrl": "https://s3..."
    }]
  }
}
```

---

## 📊 Error Responses

Toutes les erreurs suivent ce format :

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

| HTTP Code | Error Code | Description |
|-----------|------------|-------------|
| 400 | BAD_REQUEST | Paramètres invalides |
| 401 | UNAUTHORIZED | Token manquant/invalide |
| 403 | FORBIDDEN | Permissions insuffisantes |
| 404 | NOT_FOUND | Ressource inexistante |
| 500 | INTERNAL_ERROR | Erreur serveur |

---

## 🔗 WebSocket API

**URL**: `wss://xxx.execute-api.us-east-1.amazonaws.com/production`

### Actions

| Action | Payload | Description |
|--------|---------|-------------|
| `subscribe` | `{"routeId": "route-001"}` | S'abonner aux updates GPS |
| `unsubscribe` | `{"routeId": "route-001"}` | Se désabonner |

### Messages serveur

```json
{
  "type": "gps_update",
  "data": {
    "busId": "bus-001",
    "lat": 18.5429,
    "lng": -72.3388,
    "speed": 25,
    "heading": 90
  }
}
```

---

## 📌 Rate Limits

| Endpoint Pattern | Limit |
|------------------|-------|
| `/auth/*` | 10 req/min |
| `/gps/batch` | 60 req/min |
| `*` (autres) | 100 req/min |

---

## 🧪 Testing

Voir `/docs/api-tests.md` pour les tests d'intégration complets.

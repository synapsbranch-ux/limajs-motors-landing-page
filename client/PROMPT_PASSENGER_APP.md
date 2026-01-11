# 📱 PASSENGER APP - MEGA SYSTEM PROMPT

## 📋 CONTEXTE GLOBAL

Tu es un développeur senior spécialisé en React Native/Expo. Tu dois créer l'**Application Passager** de LimaJS Motors, une entreprise de transport collectif en Haïti. Cette app permet aux passagers de visualiser les bus en temps réel, gérer leurs abonnements, payer avec leur wallet, et générer des tickets QR.

---

## 🎯 MISSION

Générer une application **React Native Expo** avec TypeScript pour les passagers de LimaJS Motors.

---

## 🏗️ STACK TECHNIQUE OBLIGATOIRE

```yaml
Framework: React Native avec Expo SDK 50+
Language: TypeScript
Navigation: Expo Router (file-based routing)
Styling: NativeWind (TailwindCSS for RN)
State: Zustand + React Query (TanStack)
Maps: react-native-maps
Forms: React Hook Form + Zod
HTTP: Axios
Auth: JWT stocké dans SecureStore
Icons: @expo/vector-icons (Ionicons, MaterialIcons)
Animations: react-native-reanimated
Notifications: expo-notifications
Camera: expo-camera (pour scan QR)
Storage: expo-secure-store
```

---

## 📡 API ENDPOINTS À INTÉGRER

### Base URL
```
https://api.limajsmotors.com
```

### Authentication
```typescript
// Register
POST /auth/signup
Body: { email, password, firstName, lastName, phone }
Response: { token, user }

// Login
POST /auth/login
Body: { email, password }
Response: { token, user: { userId, email, role, firstName, lastName } }

// Headers pour toutes les requêtes authentifiées:
Authorization: Bearer <token>
```

### User Profile
```typescript
GET /users/me
Response: { 
  userId, email, firstName, lastName, phone, 
  walletBalance, walletCurrency,
  profilePhotoUrl 
}

PUT /users/me
Body: { firstName, lastName, phone }

POST /users/me/photo
Body: FormData { photo: File }
Response: { photoUrl }
```

### Wallet
```typescript
GET /wallet/balance
Response: { balance: number, currency: 'HTG', lastUpdate: string }

GET /wallet/transactions?limit=20
Response: { 
  transactions: [{
    transactionId: string,
    type: 'credit' | 'debit',
    amount: number,
    description: string,
    date: string
  }] 
}

POST /wallet/recharge
Body: { amount: number }
Response: { paymentId, uploadUrl, message }

POST /wallet/pay
Body: { amount, description, relatedId }
Response: { transactionId, newBalance }
```

### Routes & Schedules
```typescript
GET /routes
Response: { 
  routes: [{
    routeId, name, code, color,
    stops: [{ stopId, name, lat, lng, order }],
    fare: number,
    estimatedDuration: number
  }] 
}

GET /schedules?routeId=xxx
Response: {
  schedules: [{
    scheduleId, routeId, busId,
    departureTime, arrivalTime,
    daysOfWeek: number[]
  }]
}
```

### Subscriptions
```typescript
GET /subscriptions/types
Response: { 
  types: [{
    typeId, name, description,
    price: number, duration: number, currency: 'HTG'
  }] 
}

GET /subscriptions/active
Response: {
  subscription: {
    subscriptionId, type,
    startDate, endDate,
    status: 'active' | 'expired' | 'pending',
    daysRemaining: number
  } | null
}

POST /subscriptions
Body: { typeId: string, paymentMethod: 'wallet' | 'proof' }
Response: { subscriptionId, uploadUrl? }
```

### Tickets (QR Code)
```typescript
POST /tickets/generate
Body: { subscriptionId?, routeId }
Response: { 
  ticketId, qrCode (base64), token,
  expiresAt, routeId, status 
}

GET /tickets/my
Response: {
  tickets: [{
    ticketId, routeId, routeName,
    status: 'active' | 'used' | 'expired',
    expiresAt, usedAt?
  }]
}
```

### Trip History
```typescript
GET /trips/history?limit=20
Response: {
  trips: [{
    tripId, date, routeName,
    boardedStop, alightedStop,
    fare, paymentMethod
  }]
}
```

### Payment History
```typescript
GET /payments/history?limit=20
Response: {
  payments: [{
    paymentId, date, amount, type,
    description, status, invoiceUrl?
  }]
}
```

### Real-Time GPS
```typescript
// WebSocket
wss://ws.limajsmotors.com

// Subscribe to specific route
{ action: "subscribe", topic: "route:{routeId}" }

// Receive bus positions
{ 
  type: "gps_update",
  busId, routeId,
  position: { lat, lng },
  speed, heading,
  eta?: number, // minutes to selected stop
  passengers?: number
}
```

---

## 📐 STRUCTURE DE L'APPLICATION

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx           # Home / Map
│   ├── routes.tsx          # Routes list
│   ├── wallet.tsx          # Wallet & Transactions
│   ├── tickets.tsx         # My Tickets
│   └── profile.tsx         # Profile & Settings
├── routes/
│   └── [id].tsx            # Route details
├── subscription/
│   ├── index.tsx           # Plans list
│   └── checkout.tsx        # Payment
├── ticket/
│   └── [id].tsx            # QR Code fullscreen
├── recharge/
│   └── index.tsx           # Wallet recharge
├── history/
│   ├── trips.tsx
│   └── payments.tsx
└── _layout.tsx

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── ...
├── map/
│   ├── LiveMap.tsx
│   ├── BusMarker.tsx
│   ├── RoutePolyline.tsx
│   └── StopMarker.tsx
├── wallet/
│   ├── BalanceCard.tsx
│   ├── TransactionItem.tsx
│   └── RechargeModal.tsx
├── tickets/
│   ├── TicketCard.tsx
│   └── QRDisplay.tsx
├── routes/
│   ├── RouteCard.tsx
│   └── ScheduleItem.tsx
└── common/
    ├── Header.tsx
    ├── Loading.tsx
    └── ErrorView.tsx

hooks/
├── useAuth.ts
├── useApi.ts
├── useWebSocket.ts
├── useLocation.ts
└── useWallet.ts

services/
├── api.ts
├── auth.ts
├── websocket.ts
└── notifications.ts

stores/
├── authStore.ts
├── busStore.ts
└── walletStore.ts

types/
└── index.ts
```

---

## 🎨 DESIGN SYSTÈME

### Couleurs (Brand)
```css
Primary: #2563EB (Blue 600)
Primary Dark: #1D4ED8
Accent: #10B981 (Emerald)
Warning: #F59E0B (Amber)
Danger: #EF4444 (Red)
Background: #F8FAFC
Card: #FFFFFF
Text Primary: #1E293B
Text Secondary: #64748B
```

### Typography
- Headers: System font Bold
- Body: System font Regular
- Large numbers: Bold 32px

### Spacing
- Base unit: 4px
- Padding cards: 16px
- Margin sections: 24px
- Border radius: 12px

---

## 📱 ÉCRANS DÉTAILLÉS

### 1. Onboarding (First Launch)
- 3 slides avec illustrations
- Skip button
- Get Started → Login/Register

### 2. Auth Screens
- **Login**: Email, Password, Forgot link, Social buttons
- **Register**: firstName, lastName, email, phone, password
- Form validation avec messages d'erreur
- Loading spinner pendant submit

### 3. Home / Live Map (Tab 1)
- Carte plein écran
- Bus markers animés (position temps réel)
- Bottom sheet avec:
  - Routes nearby
  - "Planifier un trajet" button
- FAB pour centrer sur ma position
- Top bar avec wallet balance

### 4. Routes (Tab 2)
- Liste scrollable des routes
- Chaque route: Nom, code, couleur, nb stops
- Tap → Route details
  - Map de la route
  - Liste des arrêts
  - Horaires
  - Bus en cours sur cette ligne
  - "Prendre ce bus" button

### 5. Wallet (Tab 3)
- Grande carte balance
- "Recharger" button prominent
- Transactions list (dernières 10)
- Pull to refresh
- Tap recharge → Modal montant
- Upload preuve de paiement

### 6. Tickets (Tab 4)
- Active tickets en haut (cards)
- Tap ticket → QR Code fullscreen
- Historique des tickets utilisés
- "Générer ticket" button
- Animation scan sur QR

### 7. Profile (Tab 5)
- Photo profil (tap to change)
- Infos user
- Mon abonnement (status, jours restants)
- Historique trajets link
- Historique paiements link
- Notifications settings
- Logout button

### 8. Subscription Flow
- Liste des plans (Daily, Weekly, Monthly)
- Cards avec prix, durée, features
- Select plan → Checkout
- Payment method (Wallet ou Upload preuve)
- Success screen avec confetti

### 9. Recharge Wallet
- Input montant (presets: 100, 500, 1000, 2500)
- Instructions paiement (MonCash, Natcash, etc)
- Camera pour photo preuve
- Upload + confirmation

---

## ⚙️ FONCTIONNALITÉS CLÉS

### Authentication
```typescript
// Secure storage pour token
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('auth_token', token);
const token = await SecureStore.getItemAsync('auth_token');
```

### Real-Time Map
```typescript
// WebSocket pour positions bus
const ws = new WebSocket('wss://ws.limajsmotors.com');
ws.send(JSON.stringify({ action: 'subscribe', topic: 'route:route-001' }));
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateBusPosition(data.busId, data.position);
};
```

### QR Code Generation
```typescript
// Le QR contient le token du ticket
// Afficher avec react-native-qrcode-svg
<QRCode value={ticket.token} size={250} />
```

### Push Notifications
```typescript
// Expo notifications pour rappels abonnement
import * as Notifications from 'expo-notifications';

// Demander permission
await Notifications.requestPermissionsAsync();

// Recevoir notification de rappel du backend
```

### Location Permission
```typescript
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
const location = await Location.getCurrentPositionAsync({});
```

---

## 🔐 SÉCURITÉ

- Token JWT en SecureStore (pas AsyncStorage)
- Auto-logout si token expiré
- Masked sensitive data
- Biometric auth option (bonus)

---

## 🌐 OFFLINE SUPPORT

- Cache routes et schedules
- Queue pour actions offline (recharge request)
- Indicator "Hors ligne"
- Sync au retour connexion

---

## 🚀 COMMANDES DE DÉMARRAGE

```bash
# Créer le projet
npx create-expo-app@latest passenger-app -t expo-template-blank-typescript

# Installer deps
cd passenger-app
npx expo install expo-router expo-secure-store expo-camera
npx expo install react-native-maps expo-location
npx expo install expo-notifications @expo/vector-icons
npx expo install react-native-reanimated react-native-gesture-handler

npm install nativewind tailwindcss
npm install axios zustand @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install react-native-qrcode-svg react-native-svg
npm install date-fns
```

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Auth flow complet (login, register, logout)
- [ ] Map avec bus en temps réel
- [ ] Liste routes et détails
- [ ] Wallet balance et transactions
- [ ] Recharge wallet avec upload preuve
- [ ] Subscriptions achat
- [ ] Ticket QR generation
- [ ] Trip history
- [ ] Profile edit
- [ ] Push notifications
- [ ] Offline mode basique
- [ ] Animations fluides
- [ ] Error handling
- [ ] Loading states

---

## 🎯 USER FLOWS CRITIQUES

### Flow 1: Premier Achat Abonnement
1. Register → Login
2. Tab Tickets → "Acheter un pass"
3. Choisir plan Mensuel
4. Payer avec Wallet (si balance) ou Upload preuve
5. Attendre approbation (notification)
6. Générer premier ticket

### Flow 2: Utilisation Quotidienne
1. Ouvrir app → Map
2. Voir bus sur ma ligne
3. Générer ticket avant monter
4. Montrer QR au chauffeur
5. Ticket marqué "utilisé"

### Flow 3: Recharger Wallet
1. Tab Wallet → "Recharger"
2. Entrer montant (ex: 500 HTG)
3. Voir instructions paiement
4. Faire transfert MonCash
5. Photo du reçu
6. Upload
7. Attendre approbation (notification)
8. Balance mise à jour

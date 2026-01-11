# 🚌 DRIVER APP - MEGA SYSTEM PROMPT

## 📋 CONTEXTE GLOBAL

Tu es un développeur senior spécialisé en React Native/Expo. Tu dois créer l'**Application Chauffeur** de LimaJS Motors, une entreprise de transport collectif en Haïti. Cette app permet aux chauffeurs de gérer leurs trajets, scanner les tickets des passagers, et transmettre leur position GPS en temps réel.

---

## 🎯 MISSION

Générer une application **React Native Expo** avec TypeScript pour les chauffeurs de LimaJS Motors.

---

## 🏗️ STACK TECHNIQUE OBLIGATOIRE

```yaml
Framework: React Native avec Expo SDK 50+
Language: TypeScript
Navigation: Expo Router
Styling: NativeWind (TailwindCSS for RN)
State: Zustand
Maps: react-native-maps
Camera: expo-camera + expo-barcode-scanner
Location: expo-location (background)
HTTP: Axios
Auth: JWT en SecureStore
Icons: @expo/vector-icons
Sensors: expo-sensors (pour heading)
```

---

## 📡 API ENDPOINTS À INTÉGRER

### Base URL
```
https://api.limajsmotors.com
```

### Authentication
```typescript
POST /auth/login
Body: { email, password }
Response: { 
  token, 
  user: { userId, email, role: 'driver', firstName, lastName } 
}

// Le chauffeur DOIT avoir role === 'driver'
```

### Driver Profile
```typescript
GET /users/me
Response: { 
  userId, email, firstName, lastName, phone,
  assignedBusId?, assignedRouteId?,
  licenseNumber, status: 'available' | 'on_trip'
}
```

### Trip Management
```typescript
// Démarrer un trajet
POST /trips/start
Body: { 
  busId: string, 
  routeId: string, 
  scheduleId?: string 
}
Response: { 
  tripId, startTime, route, 
  stops: Stop[], 
  passengers: 0 
}

// Terminer un trajet
POST /trips/end
Body: { tripId }
Response: { 
  tripId, endTime, 
  totalPassengers, totalFare 
}

// Enregistrer montée passager
POST /trips/board
Body: { 
  tripId, 
  ticketToken?: string,    // QR scanné
  nfcUid?: string,         // Carte NFC
  stopId: string,
  paymentMethod: 'ticket' | 'nfc' | 'cash'
}
Response: { 
  valid: boolean, 
  passengerName?, 
  ticketId?,
  currentPassengers 
}

// Enregistrer descente passager
POST /trips/alight
Body: { tripId, stopId, count: number }
Response: { currentPassengers }

// Passagers actuels
GET /trips/current/passengers
Response: { 
  count: number, 
  boardings: [{ stopId, time, ticketId? }] 
}
```

### GPS Tracking
```typescript
// Envoi batch des positions (toutes les 10 sec)
POST /gps/batch
Body: { 
  busId: string,
  tripId?: string,
  positions: [{
    lat: number,
    lng: number,
    speed: number,
    heading: number,
    timestamp: string
  }]
}
Response: { received: number }
```

### Ticket/NFC Validation
```typescript
// Valider ticket QR
POST /tickets/validate
Body: { 
  token: string,  // QR code content
  tripId: string,
  stopId: string 
}
Response: {
  valid: boolean,
  ticketId?: string,
  passenger?: { firstName, lastName },
  message: string
}

// Valider carte NFC
POST /nfc/validate
Body: {
  nfcUid: string,
  tripId: string
}
Response: {
  valid: boolean,
  cardNumber?: string,
  balance?: number,
  fareDeducted?: number,
  passenger?: string
}
```

### Schedule du jour
```typescript
GET /schedules?driverId=me&date=today
Response: {
  schedules: [{
    scheduleId, routeId, routeName, busPlate,
    departureTime, arrivalTime, status
  }]
}
```

---

## 📐 STRUCTURE DE L'APPLICATION

```
app/
├── (auth)/
│   └── login.tsx
├── (driver)/
│   ├── _layout.tsx
│   ├── index.tsx           # Dashboard / Current Trip
│   ├── schedule.tsx        # Today's Schedule
│   ├── scan.tsx            # QR/NFC Scanner
│   └── profile.tsx         # Profile
├── trip/
│   ├── start.tsx           # Start new trip
│   ├── active.tsx          # Active trip view
│   └── summary.tsx         # Trip summary
└── _layout.tsx

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Badge.tsx
├── trip/
│   ├── TripStatusCard.tsx
│   ├── PassengerCounter.tsx
│   ├── StopProgress.tsx
│   └── BoardingModal.tsx
├── scanner/
│   ├── QRScanner.tsx
│   ├── NFCReader.tsx
│   └── ValidationResult.tsx
├── map/
│   ├── DriverMap.tsx
│   └── RouteOverlay.tsx
└── common/
    ├── Header.tsx
    └── Loading.tsx

hooks/
├── useAuth.ts
├── useTrip.ts
├── useLocation.ts
├── useGPSTracking.ts
└── useNFC.ts

services/
├── api.ts
├── auth.ts
├── gps.ts
└── scanner.ts

stores/
├── authStore.ts
├── tripStore.ts
└── locationStore.ts
```

---

## 🎨 DESIGN SYSTÈME

### Couleurs (Driver Theme - Vert)
```css
Primary: #10B981 (Emerald 500)
Primary Dark: #059669
Accent: #2563EB (Blue)
Warning: #F59E0B
Danger: #EF4444
Success: #22C55E
Background: #F8FAFC
Card: #FFFFFF
Active Trip: #DCFCE7 (Green light bg)
```

### Typography
- Large counters: Bold 48px
- Headers: Bold 24px
- Body: Regular 16px

### UX Principles
- GROS boutons (conduite = moins de précision)
- Peu de texte, beaucoup d'icônes
- Feedback haptique sur actions
- Mode sombre auto (nuit)

---

## 📱 ÉCRANS DÉTAILLÉS

### 1. Login (Chauffeur Only)
- Email + Password
- "Se souvenir de moi" 
- Logo LimaJS prominent
- Error si role !== 'driver'

### 2. Dashboard / Home
- **SI PAS DE TRAJET ACTIF:**
  - Card "Commencer un trajet"
  - Schedule du jour
  - Stats du jour (passagers, km)
  
- **SI TRAJET ACTIF:**
  - Redirect vers Active Trip

### 3. Schedule du Jour
- Liste des trajets assignés
- Chaque item: Heure, Route, Bus
- Status: À venir, En cours, Terminé
- "Démarrer" button sur prochain trajet

### 4. Start Trip
- Confirmation bus (plate number)
- Confirmation route
- "DÉMARRER LE TRAJET" gros bouton vert
- Commence tracking GPS

### 5. Active Trip (ÉCRAN PRINCIPAL)
```
┌─────────────────────────────────┐
│  🚌 Ligne A - Centre-Ville      │
│  Bus: AB-1234                   │
├─────────────────────────────────┤
│                                 │
│         PASSAGERS               │
│            23                   │
│     ┌──────┐ ┌──────┐          │
│     │  +1  │ │  -1  │          │
│     └──────┘ └──────┘          │
│                                 │
├─────────────────────────────────┤
│  Prochain arrêt:                │
│  📍 Gare Centrale   (2 min)     │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │   📷 SCANNER TICKET     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   🛑 TERMINER TRAJET    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

- Compteur passagers GRAND (tap +1/-1)
- Bouton scanner prominent
- Progress bar des stops
- ETA prochain arrêt
- Bouton terminer (confirmation modal)

### 6. QR/NFC Scanner
- Camera fullscreen
- Overlay avec cadre de scan
- Toggle QR / NFC
- Résultat instantané:
  - ✅ Vert = Valide (son + vibration)
  - ❌ Rouge = Invalide (message d'erreur)
- Auto-close après succès
- Passenger count +1 auto

### 7. Trip Summary
- Total passagers
- Durée trajet
- Stops effectués
- Revenue estimé
- "Nouveau trajet" ou "Retour home"

### 8. Profile
- Photo chauffeur
- Nom, License ID
- Bus assigné
- Stats: Total trajets, Total passagers
- Logout

---

## ⚙️ FONCTIONNALITÉS CLÉS

### GPS Background Tracking
```typescript
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  const { locations } = data as any;
  
  // Buffer positions
  positionBuffer.push({
    lat: locations[0].coords.latitude,
    lng: locations[0].coords.longitude,
    speed: locations[0].coords.speed,
    heading: locations[0].coords.heading,
    timestamp: new Date().toISOString()
  });
  
  // Send batch every 10 positions
  if (positionBuffer.length >= 10) {
    await sendPositionBatch(positionBuffer);
    positionBuffer = [];
  }
});

// Start tracking
await Location.startLocationUpdatesAsync(LOCATION_TASK, {
  accuracy: Location.Accuracy.High,
  distanceInterval: 10, // meters
  timeInterval: 3000,   // ms
  foregroundService: {
    notificationTitle: 'LimaJS Driver',
    notificationBody: 'Tracking GPS en cours'
  }
});
```

### QR Scanner
```typescript
import { BarCodeScanner } from 'expo-barcode-scanner';

const handleBarCodeScanned = async ({ data }) => {
  // data = ticket token
  const result = await api.post('/tickets/validate', {
    token: data,
    tripId: currentTrip.tripId,
    stopId: currentStop.stopId
  });
  
  if (result.valid) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    incrementPassengers();
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    showError(result.message);
  }
};
```

### NFC Reader (Android)
```typescript
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const readNfc = async () => {
  await NfcManager.requestTechnology(NfcTech.NfcA);
  const tag = await NfcManager.getTag();
  const uid = tag.id; // NFC UID
  
  const result = await api.post('/nfc/validate', {
    nfcUid: uid,
    tripId: currentTrip.tripId
  });
  
  // Handle result
};
```

### Passenger Counter
```typescript
// Optimistic update + sync
const incrementPassengers = () => {
  setLocalCount(prev => prev + 1);
  api.post('/trips/board', {
    tripId,
    stopId: currentStop,
    paymentMethod: 'cash'
  });
};

const decrementPassengers = () => {
  if (localCount > 0) {
    setLocalCount(prev => prev - 1);
    api.post('/trips/alight', {
      tripId,
      stopId: currentStop,
      count: 1
    });
  }
};
```

---

## 🔐 SÉCURITÉ

- Vérifier role === 'driver' côté app ET API
- SecureStore pour credentials
- Auto-logout si token expiré
- Ne pas permettre 2 trajets actifs

---

## 🔋 OPTIMISATIONS

### Battery
- GPS accuracy adaptative
- Batch API calls
- Reduce polling frequency quand stationnaire

### Offline
- Queue des boardings si offline
- Sync au retour connexion
- Local storage du trajet en cours

### Performance
- Minimal re-renders
- Lazy loading
- Small bundle size

---

## 🚀 COMMANDES DE DÉMARRAGE

```bash
# Créer le projet
npx create-expo-app@latest driver-app -t expo-template-blank-typescript

# Installer deps
cd driver-app
npx expo install expo-router expo-secure-store
npx expo install expo-location expo-task-manager
npx expo install expo-camera expo-barcode-scanner
npx expo install expo-haptics expo-sensors
npx expo install react-native-maps

npm install nativewind tailwindcss
npm install axios zustand
npm install date-fns

# Pour NFC (Android only)
npm install react-native-nfc-manager
```

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Login chauffeur uniquement
- [ ] Démarrer trajet
- [ ] GPS tracking background
- [ ] Scan QR ticket
- [ ] Compteur passagers +/-
- [ ] Progress stops
- [ ] Terminer trajet
- [ ] Summary avec stats
- [ ] Schedule du jour
- [ ] NFC support (Android)
- [ ] Offline queue
- [ ] Notifications foreground service
- [ ] Battery optimized

---

## 🎯 USER FLOWS CRITIQUES

### Flow 1: Journée Typique
1. Login au début du service
2. Voir schedule du jour
3. Tap "Démarrer" sur premier trajet
4. GPS commence
5. À chaque arrêt: Scanner tickets ou +1 cash
6. Arrivée terminus → Terminer trajet
7. Voir summary
8. Recommencer prochain trajet

### Flow 2: Scan Ticket
1. Passager monte
2. Tap "Scanner"
3. Camera s'ouvre
4. Pointer QR du passager
5. Résultat instantané (✅/❌)
6. Retour auto à l'écran principal
7. Compteur +1

### Flow 3: Passager Cash
1. Passager monte sans ticket
2. Passager paye cash
3. Driver tap "+1" 
4. Compteur incrémente
5. Système enregistre boarding

---

## 🎨 UI/UX SPÉCIFIQUES CHAUFFEUR

### Gros Boutons
- Minimum 48px hauteur
- Touch area 64px
- Espacement généreux

### Feedback Haptique
- Succès: Vibration légère
- Erreur: Vibration forte
- Action importante: Vibration double

### Contraste Élevé
- Texte: #000 sur fond clair
- Boutons: Couleurs vives
- Mode sombre auto après 19h

### Une Main
- Actions principales accessibles pouce
- Pas de gestes complexes
- Confirmation verbale (TTS bonus)

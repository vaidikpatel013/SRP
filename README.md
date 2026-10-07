# GeoSafe: Urban Safety Analytics & Real-Time Emergency Response System

**Academic Final Year Project MVP**  
*Lead Architect: Principal Mobile & Cloud Architect*

---

## 🌟 Executive Overview
**GeoSafe** is an advanced, production-grade mobile public safety platform designed to protect citizens in dense urban environments. Built using **React Native (TypeScript) + Expo** and **Flutter (Dart)** with **Google Maps SDK** and **Firebase Cloud Services**, GeoSafe combines empirical urban crime analytics (from Mumbai and Delhi ride safety datasets) with immediate life-saving response mechanisms:

1. **Interactive Spatial Risk Map**: Live GPS map rendering 80 clustered safety zones across Mumbai and Delhi color-coded by composite risk category (Green = Low, Yellow = Moderate, Red = High).
2. **Current Area Risk Card**: Floating HUD displaying localized risk scores (1.0 - 5.0), CCTV camera density, and nearby police station coverage.
3. **One-Tap Guardian SOS & Real-Time Location Streaming**: 5-second countdown with vibration feedback that initiates an active emergency and streams live GPS coordinates to Firestore every 5 seconds.
4. **Guardian Live Tracker**: Real-time map view allowing guardians to follow the victim's moving GPS marker.
5. **Fake Incoming Call Simulator**: Realistic full-screen incoming call emulator with telephony ringtone audio, customizable delay (5s, 10s, 30s), and talk duration timer to discreetly escape unsafe situations.
6. **Urban Safety Analytics**: Deep-dive analytics dashboard analyzing diurnal (day vs. night) risk multipliers and cross-city metrics.

---

## 🏗️ Repository Structure

```
d:\Project\
├── geosafe-mobile/                 # Complete, runnable React Native (TypeScript) + Expo App
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.ts        # Firebase Auth & Firestore client configuration
│   │   ├── types/
│   │   │   └── index.ts           # Domain models & TypeScript interfaces
│   │   ├── services/
│   │   │   ├── AuthService.ts     # Anonymous / Email Auth & Profile Service
│   │   │   ├── SafetyZoneService.ts # Spatial Haversine analytics & dataset loader
│   │   │   ├── EmergencyService.ts # Firestore active_emergencies & GPS streaming
│   │   │   ├── LocationService.ts  # Continuous GPS positioning (expo-location)
│   │   │   └── FakeCallService.ts  # Web Audio synthesized ringtone & haptics
│   │   ├── context/
│   │   │   ├── AuthContext.tsx    # User authentication & emergency contact state
│   │   │   ├── SafetyContext.tsx  # Zones, filters, and nearest-location state
│   │   │   └── EmergencyContext.tsx # SOS countdown, streaming & fake call state
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── SafeZoneMap.web.tsx    # Leaflet interactive web map
│   │   │   │   ├── SafeZoneMap.native.tsx # Google Maps SDK (react-native-maps)
│   │   │   │   └── SafeZoneMap.tsx        # Universal platform bridge
│   │   │   ├── RiskCard/
│   │   │   │   └── CurrentAreaRiskCard.tsx # Floating risk metrics HUD
│   │   │   ├── SOS/
│   │   │   │   └── HoldForSOSButton.tsx    # 5s countdown SOS button
│   │   │   ├── FakeCall/
│   │   │   │   └── FakeCallModal.tsx       # Realistic incoming call overlay
│   │   │   └── Guardian/
│   │   │       └── GuardianTrackingView.tsx # Real-time moving marker viewer
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx             # Main dashboard & interactive map
│   │   │   ├── AuthScreen.tsx             # Login & emergency profile configuration
│   │   │   ├── SafetyAnalyticsScreen.tsx  # Hotspots & diurnal time analysis
│   │   │   └── SettingsScreen.tsx         # Contact, caller ID & cloud toggles
│   │   └── data/
│   │       └── safety_zones.json          # 80 pre-calculated urban risk zones
│   ├── App.tsx                            # Root component with responsive frame
│   ├── package.json                       # Dependencies & scripts
│   └── tsconfig.json                      # TypeScript strict compiler options
│
├── flutter_geosafe/                # Complete Flutter (Dart) Clean Architecture App
│   ├── lib/
│   │   ├── models/                # UserProfile, SafetyZone, ActiveEmergency
│   │   ├── services/              # AuthService, SafetyZoneService, EmergencyService
│   │   ├── providers/             # SafetyProvider, EmergencyProvider, AuthProvider
│   │   ├── screens/               # HomeMapScreen, AuthScreen, GuardianScreen, FakeCallScreen
│   │   ├── widgets/               # CurrentAreaRiskCard, HoldForSOSButton
│   │   └── main.dart              # MultiProvider MaterialApp
│   ├── assets/
│   │   └── safety_zones.json      # Bundled offline safety dataset
│   └── pubspec.yaml               # Flutter dependencies (google_maps_flutter, firebase, etc.)
│
├── firebase_safety_zones.json      # Aggregated urban crime safety zones dataset
├── cleaned_ride_safety_dataset.csv # Cleaned CSV with calculated risk scores
├── clean_dataset.py                # Dataset cleaning & score generation pipeline
├── seed_firestore.py               # Python batch upload script for Firestore
├── seed_firestore.js               # Node.js batch upload script for Firestore
├── firestore.rules                 # Production Firestore security rules
├── firestore.indexes.json          # Firestore composite indexes
├── firebase.json                   # Firebase deployment configuration
└── ARCHITECTURE.md                 # System Architecture & Mathematical Formulation
```

---

## 🚀 Quick Start Guide

### 1. Run React Native (TypeScript) App Instantly

The React Native app runs seamlessly on desktop browsers (with a phone frame) and on physical smartphones via Expo Go:

```bash
# Navigate to project directory
cd geosafe-mobile

# Run in Web Browser (Chrome / Edge / Firefox)
npm run web

# Or run with Expo interactive CLI (scan QR code in Expo Go app)
npm start
```

> **Note on Zero Configuration Testing**: The app includes an automatic offline dataset cache (80 zones from Mumbai and Delhi) and an in-memory real-time event pipeline. Even before you link your Firebase credentials, every feature works out of the box!

### 2. Run Flutter (Dart) App

```bash
cd flutter_geosafe
flutter pub get
flutter run
```

---

## ☁️ Firebase Cloud Setup & Database Seeding

### Step 1: Firebase Project Setup
1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project named `geosafe`.
2. Enable **Authentication** (Anonymous and Email/Password).
3. Enable **Cloud Firestore Database** in Production mode.
4. Deploy the security rules from `firestore.rules`.

### Step 2: Seed the 80 Safety Zones into Firestore
Download your `serviceAccountKey.json` from **Firebase Console -> Project Settings -> Service Accounts**, save it in `d:\Project\`, and run:

**Using Python:**
```bash
pip install firebase-admin
python seed_firestore.py serviceAccountKey.json
```

**Using Node.js:**
```bash
npm install firebase-admin
node seed_firestore.js serviceAccountKey.json
```

---

## 📊 Database Schema

### Collection: `users`
| Field | Type | Description |
|---|---|---|
| `uid` | String | Unique Firebase user ID (Primary Key) |
| `name` | String | User's full name |
| `phone` | String | User's personal phone number |
| `emergency_contact` | String | Primary emergency guardian phone number |
| `created_at` | Timestamp | Account creation timestamp |

### Collection: `safety_zones`
| Field | Type | Description |
|---|---|---|
| `City` | String | Urban metro name (`"Mumbai"` or `"Delhi"`) |
| `Location` | String | Locality centroid name (e.g. `"Andheri"`, `"Connaught Place"`) |
| `Time_of_Day` | String | Observation interval (`"Morning"`, `"Afternoon"`, `"Evening"`, `"Night"`) |
| `avg_risk_score` | Number | Normalized risk index from `1.00` to `5.00` |
| `risk_category` | String | Categorical risk label (`"Low Risk"`, `"Moderate Risk"`, `"High Risk"`) |
| `center_lat` | Number | Spatial latitude centroid coordinate |
| `center_lng` | Number | Spatial longitude centroid coordinate |
| `avg_cctv` | Number | Average count of operational CCTV cameras in zone |
| `avg_police_stations` | Number | Nearby police stations count |

### Collection: `active_emergencies`
| Field | Type | Description |
|---|---|---|
| `emergency_id` | String | Unique SOS alert token (e.g. `"sos_1709823412"`) |
| `user_id` | String | Reference to the triggering user |
| `status` | String | Current state (`"ACTIVE"` or `"RESOLVED"`) |
| `current_lat` | Number | Real-time streaming GPS latitude |
| `current_lng` | Number | Real-time streaming GPS longitude |
| `last_updated` | Timestamp | Timestamp of the most recent 5-second coordinate update |

---

## 🎓 Academic Defense & Viva Presentation Guide

### Key Questions & Architectural Rationale

1. **Why does GeoSafe apply a diurnal time-of-day weight factor?**
   * *Answer*: Urban crime incidence is strongly correlated with natural surveillance (Jane Jacobs' "eyes on the street" principle). Night-time hours experience lower pedestrian traffic and reduced transit availability; thus, the model weights night incidents by 1.6x to reflect elevated vulnerability.

2. **How does the real-time GPS streaming minimize battery consumption?**
   * *Answer*: High-frequency GPS streaming (every 5s) only engages once the SOS countdown completes and transitions to `ACTIVE`. During regular standby navigation, GeoSafe employs balanced power accuracy with distance filters.

3. **How does the system ensure resilience in low-connectivity areas?**
   * *Answer*: GeoSafe embeds the 80 pre-calculated urban risk clusters in client-side storage (`safety_zones.json`). When network connectivity is intermittent, the Haversine distance calculator continues to evaluate local risk offline.

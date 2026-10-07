# GeoSafe: System Architecture & Engineering Specification

## Academic Project Title
**GeoSafe: Urban Safety Analytics & Real-Time Emergency Response System**

---

## 1. Executive Architecture Summary

GeoSafe is architected as a high-reliability, low-latency mobile and cloud platform engineered to tackle urban public safety concerns across major metropolitan clusters (Mumbai and Delhi). The system merges **offline-resilient spatial clustering analytics** with **real-time reactive telemetry streaming** using Firebase Firestore and Google Maps SDK.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|                                                                                   |
|  [ React Native (TS) / Expo ]                [ Flutter (Dart) Clean Architecture ]|
|  +----------------------------+              +------------------------------------+|
|  | - Universal Map Abstraction|              | - Google Maps Flutter Layer        ||
|  | - State: Context API       |              | - State: MultiProvider             ||
|  | - Sound & Haptics Synthesis|              | - AudioPlayers & Vibration         ||
|  | - GPS Continuous Streamer  |              | - Geolocator High Accuracy Stream  ||
|  +----------------------------+              +------------------------------------+|
+----------------------------------------+------------------------------------------+
                                         |  HTTPS / WebSocket (onSnapshot)
                                         v
+-----------------------------------------------------------------------------------+
|                               CLOUD BACKEND TIER                                  |
|                                                                                   |
|  [ Firebase Authentication ]                 [ Firebase Cloud Firestore ]         |
|  + Anonymous Session Tokens                  + Collection: 'users'                |
|  + Email/Password & Phone Auth               + Collection: 'safety_zones' (80)    |
|                                              + Collection: 'active_emergencies'   |
|                                                                                   |
|  [ Firebase Security Rules ]                 [ Real-Time Data Pipeline ]          |
|  + Role-Based Document Access                + 5-Second GPS Streaming Updates     |
|  + Public Emergency Broadcast Read           + Guardian Subscriber Notifications  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Mathematical Formulation & Algorithmic Foundation

### 2.1 Raw Incident Risk Score Formulation
The model computes a baseline raw risk score for any urban sector based on multi-variate crime characteristics:

$$\text{Raw Risk Score} = \left( 0.4 \cdot S_{\text{crime}} + 0.2 \cdot C_{\text{public}} + 0.2 \cdot (10 - \min(10, N_{\text{cctv}})) + 0.2 \cdot (5 - \min(5, N_{\text{police}})) \right) \cdot W_{\text{time}}$$

Where:
- $S_{\text{crime}}$: Crime Severity Index (1.0 to 10.0 scale)
- $C_{\text{public}}$: Public complaints frequency
- $N_{\text{cctv}}$: Nearby CCTV surveillance camera density
- $N_{\text{police}}$: Number of police stations within emergency response radius
- $W_{\text{time}}$: Diurnal Time-of-Day weight factor:
  - $\text{Morning (05:00 - 11:59)} \implies 1.0$
  - $\text{Afternoon (12:00 - 16:59)} \implies 1.1$
  - $\text{Evening (17:00 - 20:59)} \implies 1.3$
  - $\text{Night (21:00 - 04:59)} \implies 1.6$

### 2.2 Normalization to 1.0 - 5.0 Safety Score Scale
The raw score is mapped onto a standardized safety score:

$$\text{Calculated Risk Score} = 1 + 4 \cdot \left( \frac{\text{Raw Risk Score} - \min(\text{Raw})}{\max(\text{Raw}) - \min(\text{Raw})} \right)$$

### 2.3 Risk Category Thresholds
- **Low Risk (Green):** $\text{Score} < 2.20$
- **Moderate Risk (Yellow/Amber):** $2.20 \le \text{Score} < 3.50$
- **High Risk (Red):** $\text{Score} \ge 3.50$

### 2.4 Haversine Spatial Proximity Metric
To associate any moving user coordinate $(\phi_u, \lambda_u)$ with the closest pre-calculated urban risk centroid $(\phi_z, \lambda_z)$:

$$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_u)\cos(\phi_z)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

Where $R = 6371\text{ km}$. The client evaluates distance in real time and automatically updates the **Current Area Risk Card**.

---

## 3. Real-Time Emergency Response Pipeline

1. **Activation Trigger**: User holds the **HOLD FOR SOS** button.
2. **5-Second Countdown**:
   - `Haptics.notificationAsync` / Device Vibration triggers every second.
   - Screen displays countdown timer with a prominent **CANCEL** button to prevent false alarms.
3. **Dispatch & Cloud Sync**:
   - If countdown reaches 0, client generates document in Firestore:
     ```json
     {
       "emergency_id": "sos_1709823412",
       "user_id": "uid_7728",
       "status": "ACTIVE",
       "current_lat": 19.1136,
       "current_lng": 72.8697,
       "last_updated": "SERVER_TIMESTAMP"
     }
     ```
4. **GPS Streaming**:
   - Background worker pushes updated coordinates every 5,000ms.
5. **Guardian Live Tracker**:
   - Subscribes via Firestore `onSnapshot`.
   - Renders a moving red beacon marker with a historical coordinate path.

---

## 4. Fake Call Simulator Design

The Fake Call Simulator operates independently of carrier networks:
- **Delay scheduler**: 0s (Instant), 5s, 10s, 30s presets.
- **Audio synthesis**: Web Audio API oscillator synthesis generating standardized telephony frequencies ($440\text{ Hz} + 480\text{ Hz}$) in a 2-second burst cadence, ensuring reliable audio playback with zero external asset dependencies.
- **Haptic rhythm**: Dual pulse vibration cadence mimicking standard incoming telephony calls.
- **Full-Screen takeover**: Transitions from realistic incoming ring screen to active call screen with live talk timer.

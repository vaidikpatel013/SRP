import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { ActiveEmergency } from '../types';

type EmergencyListener = (emergency: ActiveEmergency | null) => void;
type EmergencyListListener = (emergencies: ActiveEmergency[]) => void;

class EmergencyService {
  private activeEmergencyId: string | null = null;
  private trackingInterval: any = null;
  private mockEmergencies: Map<string, ActiveEmergency> = new Map();
  private mockListeners: Map<string, Set<EmergencyListener>> = new Map();
  private mockListListeners: Set<EmergencyListListener> = new Set();

  /**
   * Create or activate an emergency in Firestore `active_emergencies`
   */
  async triggerSOS(
    userId: string,
    initialLat: number,
    initialLng: number,
    metadata?: { name?: string; phone?: string; emergency_contact?: string }
  ): Promise<string> {
    const emergencyId = 'sos_' + Date.now();
    this.activeEmergencyId = emergencyId;

    const emergencyData: ActiveEmergency = {
      emergency_id: emergencyId,
      user_id: userId,
      user_name: metadata?.name || 'GeoSafe User',
      user_phone: metadata?.phone || '',
      emergency_contact: metadata?.emergency_contact || '',
      status: 'ACTIVE',
      current_lat: initialLat,
      current_lng: initialLng,
      last_updated: Date.now(),
      history: [{ lat: initialLat, lng: initialLng, timestamp: Date.now() }]
    };

    if (isFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'active_emergencies', emergencyId), {
          emergency_id: emergencyId,
          user_id: userId,
          user_name: emergencyData.user_name,
          user_phone: emergencyData.user_phone,
          emergency_contact: emergencyData.emergency_contact,
          status: 'ACTIVE',
          current_lat: initialLat,
          current_lng: initialLng,
          last_updated: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore emergency creation failed, continuing locally:', err);
      }
    }

    // Update in-memory / mock state
    this.mockEmergencies.set(emergencyId, emergencyData);
    this.notifyMockListeners(emergencyId, emergencyData);
    this.notifyListListeners();

    return emergencyId;
  }

  /**
   * Stream live GPS coordinates to Firestore active emergency document every 5 seconds
   */
  async updateEmergencyLocation(lat: number, lng: number): Promise<void> {
    if (!this.activeEmergencyId) return;

    const emergencyId = this.activeEmergencyId;

    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'active_emergencies', emergencyId), {
          current_lat: lat,
          current_lng: lng,
          last_updated: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore coordinate stream error:', err);
      }
    }

    // In-memory update
    const existing = this.mockEmergencies.get(emergencyId);
    if (existing) {
      const updated: ActiveEmergency = {
        ...existing,
        current_lat: lat,
        current_lng: lng,
        last_updated: Date.now(),
        history: [...(existing.history || []), { lat, lng, timestamp: Date.now() }]
      };
      this.mockEmergencies.set(emergencyId, updated);
      this.notifyMockListeners(emergencyId, updated);
      this.notifyListListeners();
    }
  }

  /**
   * Resolve an active emergency
   */
  async resolveEmergency(emergencyId?: string): Promise<void> {
    const targetId = emergencyId || this.activeEmergencyId;
    if (!targetId) return;

    if (isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'active_emergencies', targetId), {
          status: 'RESOLVED',
          last_updated: serverTimestamp()
        });
      } catch (err) {
        console.warn('Error resolving emergency in Firestore:', err);
      }
    }

    const existing = this.mockEmergencies.get(targetId);
    if (existing) {
      const resolved: ActiveEmergency = {
        ...existing,
        status: 'RESOLVED',
        last_updated: Date.now()
      };
      this.mockEmergencies.set(targetId, resolved);
      this.notifyMockListeners(targetId, resolved);
      this.notifyListListeners();
    }

    if (targetId === this.activeEmergencyId) {
      this.activeEmergencyId = null;
      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = null;
      }
    }
  }

  /**
   * Guardian Live Tracker Subscription:
   * Real-time listener for a specific emergency ID.
   */
  subscribeToEmergency(
    emergencyId: string,
    callback: EmergencyListener
  ): () => void {
    if (isFirebaseConfigured()) {
      const unsubscribe = onSnapshot(
        doc(db, 'active_emergencies', emergencyId),
        (docSnap) => {
          if (docSnap.exists()) {
            callback(docSnap.data() as ActiveEmergency);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.warn('Firestore real-time subscription error:', error);
          callback(this.mockEmergencies.get(emergencyId) || null);
        }
      );
      return unsubscribe;
    } else {
      if (!this.mockListeners.has(emergencyId)) {
        this.mockListeners.set(emergencyId, new Set());
      }
      this.mockListeners.get(emergencyId)!.add(callback);
      // Immediately invoke with current value
      callback(this.mockEmergencies.get(emergencyId) || null);

      return () => {
        this.mockListeners.get(emergencyId)?.delete(callback);
      };
    }
  }

  /**
   * Real-time listener for all active emergencies (for guardian or admin dashboard)
   */
  subscribeToActiveEmergencies(callback: EmergencyListListener): () => void {
    if (isFirebaseConfigured()) {
      const q = query(
        collection(db, 'active_emergencies'),
        where('status', '==', 'ACTIVE')
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map(d => d.data() as ActiveEmergency);
          callback(list);
        },
        (err) => {
          console.warn('Firestore active emergencies query error:', err);
          const activeList = Array.from(this.mockEmergencies.values()).filter(
            e => e.status === 'ACTIVE'
          );
          callback(activeList);
        }
      );
    } else {
      this.mockListListeners.add(callback);
      const activeList = Array.from(this.mockEmergencies.values()).filter(
        e => e.status === 'ACTIVE'
      );
      callback(activeList);

      return () => {
        this.mockListListeners.delete(callback);
      };
    }
  }

  private notifyMockListeners(emergencyId: string, data: ActiveEmergency) {
    const listeners = this.mockListeners.get(emergencyId);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }

  private notifyListListeners() {
    const activeList = Array.from(this.mockEmergencies.values()).filter(
      e => e.status === 'ACTIVE'
    );
    this.mockListListeners.forEach(cb => cb(activeList));
  }

  getActiveEmergencyId(): string | null {
    return this.activeEmergencyId;
  }
}

export const emergencyService = new EmergencyService();

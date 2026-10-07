import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { SafetyZone, RiskCategory, TimeOfDay } from '../types';
import localSafetyZones from '../data/safety_zones.json';

class SafetyZoneService {
  private cachedZones: SafetyZone[] = [];

  /**
   * Fetch all safety zones from Firestore or local bundled dataset.
   */
  async getSafetyZones(forceRefresh = false): Promise<SafetyZone[]> {
    if (this.cachedZones.length > 0 && !forceRefresh) {
      return this.cachedZones;
    }

    if (isFirebaseConfigured()) {
      try {
        const zonesCollection = collection(db, 'safety_zones');
        const snapshot = await getDocs(zonesCollection);
        if (!snapshot.empty) {
          const remoteZones: SafetyZone[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<SafetyZone, 'id'>)
          }));
          this.cachedZones = remoteZones;
          return remoteZones;
        }
      } catch (err) {
        console.warn('Firestore fetch failed, falling back to local dataset:', err);
      }
    }

    // Fallback: bundled pre-calculated dataset from Mumbai and Delhi (80 zones)
    this.cachedZones = (localSafetyZones as unknown) as SafetyZone[];
    return this.cachedZones;
  }

  /**
   * Filter safety zones by City, Time of Day, or Risk Level.
   */
  async filterZones(city?: string, timeOfDay?: string, riskCategory?: string): Promise<SafetyZone[]> {
    const zones = await this.getSafetyZones();
    return zones.filter(zone => {
      if (city && city !== 'All' && zone.City.toLowerCase() !== city.toLowerCase()) {
        return false;
      }
      if (timeOfDay && timeOfDay !== 'All' && zone.Time_of_Day.toLowerCase() !== timeOfDay.toLowerCase()) {
        return false;
      }
      if (riskCategory && riskCategory !== 'All' && zone.risk_category !== riskCategory) {
        return false;
      }
      return true;
    });
  }

  /**
   * Calculate Haversine distance in kilometers between two GPS coordinates.
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Determine current Time of Day based on system clock.
   */
  getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  }

  /**
   * Find the nearest safety zone to a user's current GPS location.
   */
  async findNearestZone(
    lat: number,
    lng: number,
    preferredTimeOfDay?: string
  ): Promise<{ zone: SafetyZone; distanceKm: number } | null> {
    const zones = await this.getSafetyZones();
    if (zones.length === 0) return null;

    const timeOfDay = preferredTimeOfDay || this.getCurrentTimeOfDay();

    // Prioritize matching current time of day if available
    const timeMatchedZones = zones.filter(
      z => z.Time_of_Day.toLowerCase() === timeOfDay.toLowerCase()
    );
    const candidateZones = timeMatchedZones.length > 0 ? timeMatchedZones : zones;

    let nearestZone = candidateZones[0];
    let minDistance = this.calculateDistanceKm(
      lat,
      lng,
      nearestZone.center_lat,
      nearestZone.center_lng
    );

    for (let i = 1; i < candidateZones.length; i++) {
      const z = candidateZones[i];
      const dist = this.calculateDistanceKm(lat, lng, z.center_lat, z.center_lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestZone = z;
      }
    }

    return { zone: nearestZone, distanceKm: parseFloat(minDistance.toFixed(2)) };
  }

  /**
   * Map risk category to color code
   */
  getRiskColor(category: RiskCategory): string {
    switch (category) {
      case 'Low Risk':
        return '#10B981'; // Green
      case 'Moderate Risk':
        return '#F59E0B'; // Amber / Yellow
      case 'High Risk':
        return '#EF4444'; // Red
      default:
        return '#6B7280';
    }
  }

  /**
   * Map risk category to fill opacity color
   */
  getRiskFillColor(category: RiskCategory): string {
    switch (category) {
      case 'Low Risk':
        return 'rgba(16, 185, 129, 0.28)';
      case 'Moderate Risk':
        return 'rgba(245, 158, 11, 0.32)';
      case 'High Risk':
        return 'rgba(239, 68, 68, 0.35)';
      default:
        return 'rgba(107, 114, 128, 0.2)';
    }
  }
}

export const safetyZoneService = new SafetyZoneService();

import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { UserLocation } from '../types';

class LocationService {
  // Default coordinates: Mumbai (Andheri/BKC central hub)
  private defaultLocation: UserLocation = {
    latitude: 19.0760,
    longitude: 72.8777,
    accuracy: 10,
    timestamp: Date.now()
  };

  private locationSubscription: Location.LocationSubscription | null = null;
  private watchTimer: any = null;

  /**
   * Request device location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          return true;
        }
        return false;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn('Location permission request failed:', err);
      return false;
    }
  }

  /**
   * Get current GPS location with resilient fallback
   */
  async getCurrentLocation(): Promise<UserLocation> {
    try {
      if (Platform.OS === 'web' && 'geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                timestamp: pos.timestamp
              });
            },
            () => {
              resolve(this.defaultLocation);
            },
            { timeout: 5000, enableHighAccuracy: true }
          );
        });
      }

      const hasPerm = await this.requestPermissions();
      if (hasPerm) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        return {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy || 10,
          timestamp: loc.timestamp
        };
      }
    } catch (err) {
      console.warn('Failed getting current location, using default:', err);
    }

    return this.defaultLocation;
  }

  /**
   * Start streaming GPS location every 5 seconds
   */
  async startLocationStreaming(
    callback: (location: UserLocation) => void,
    intervalMs = 5000
  ): Promise<() => void> {
    // Immediate first fetch
    const initial = await this.getCurrentLocation();
    callback(initial);

    let currentLat = initial.latitude;
    let currentLng = initial.longitude;

    if (Platform.OS === 'web') {
      this.watchTimer = setInterval(async () => {
        // In web or testing, simulate slight realistic micro-movement (walking speed)
        currentLat += (Math.random() - 0.5) * 0.0003;
        currentLng += (Math.random() - 0.5) * 0.0003;
        callback({
          latitude: currentLat,
          longitude: currentLng,
          accuracy: 5,
          timestamp: Date.now()
        });
      }, intervalMs);

      return () => {
        if (this.watchTimer) {
          clearInterval(this.watchTimer);
          this.watchTimer = null;
        }
      };
    }

    try {
      const hasPerm = await this.requestPermissions();
      if (hasPerm) {
        this.locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: intervalMs,
            distanceInterval: 5
          },
          (loc) => {
            callback({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy || 10,
              timestamp: loc.timestamp
            });
          }
        );

        return () => {
          if (this.locationSubscription) {
            this.locationSubscription.remove();
            this.locationSubscription = null;
          }
        };
      }
    } catch (err) {
      console.warn('Native location watcher failed, falling back to interval:', err);
    }

    // Interval fallback for native if watchPosition fails
    this.watchTimer = setInterval(async () => {
      const loc = await this.getCurrentLocation();
      callback(loc);
    }, intervalMs);

    return () => {
      if (this.watchTimer) {
        clearInterval(this.watchTimer);
        this.watchTimer = null;
      }
    };
  }
}

export const locationService = new LocationService();

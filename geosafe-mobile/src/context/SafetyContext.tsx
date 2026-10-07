import React, { createContext, useContext, useState, useEffect } from 'react';
import { SafetyZone, UserLocation, TimeOfDay } from '../types';
import { safetyZoneService } from '../services/SafetyZoneService';
import { locationService } from '../services/LocationService';

interface SafetyContextType {
  zones: SafetyZone[];
  filteredZones: SafetyZone[];
  isLoading: boolean;
  userLocation: UserLocation;
  nearestZone: SafetyZone | null;
  distanceToNearestKm: number;
  cityFilter: string;
  timeOfDayFilter: string;
  riskFilter: string;
  setCityFilter: (city: string) => void;
  setTimeOfDayFilter: (time: string) => void;
  setRiskFilter: (risk: string) => void;
  refreshZones: () => Promise<void>;
  selectCity: (city: 'Mumbai' | 'Delhi') => void;
  simulateLocation: (city: 'Mumbai' | 'Delhi') => void;
  selectLocation: (zone: SafetyZone) => void;
}

const SafetyContext = createContext<SafetyContextType>({} as SafetyContextType);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [filteredZones, setFilteredZones] = useState<SafetyZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Default initial: Mumbai (Bandra Kurla Complex)
  const [cityFilter, setCityFilter] = useState<string>('Mumbai');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<string>('Night');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: 19.0657,
    longitude: 72.8643,
    accuracy: 5,
    timestamp: Date.now()
  });

  const [nearestZone, setNearestZone] = useState<SafetyZone | null>(null);
  const [distanceToNearestKm, setDistanceToNearestKm] = useState<number>(0);

  // Load zones
  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void locationService.startLocationStreaming(setUserLocation, 5000).then(unsubscribe => {
      if (cancelled) {
        unsubscribe();
      } else {
        cleanup = unsubscribe;
      }
    }).catch(error => {
      console.warn('Unable to start location streaming:', error);
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const loadZones = async () => {
    setIsLoading(true);
    try {
      const allZones = await safetyZoneService.getSafetyZones(true);
      setZones(allZones);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-filter when zones, city, time, or risk filter changes
  useEffect(() => {
    if (zones.length === 0) return;

    let result = [...zones];
    if (cityFilter !== 'All') {
      result = result.filter(z => z.City.toLowerCase() === cityFilter.toLowerCase());
    }
    if (timeOfDayFilter !== 'All') {
      result = result.filter(z => z.Time_of_Day.toLowerCase() === timeOfDayFilter.toLowerCase());
    }
    if (riskFilter !== 'All') {
      result = result.filter(z => z.risk_category.toLowerCase() === riskFilter.toLowerCase());
    }

    setFilteredZones(result);

    // Update nearest zone within the filtered city
    const candidates = cityFilter !== 'All' ? zones.filter(z => z.City.toLowerCase() === cityFilter.toLowerCase()) : zones;
    if (candidates.length > 0) {
      let closest = candidates[0];
      let minDist = safetyZoneService.calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        closest.center_lat,
        closest.center_lng
      );

      for (let i = 1; i < candidates.length; i++) {
        const d = safetyZoneService.calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          candidates[i].center_lat,
          candidates[i].center_lng
        );
        if (d < minDist) {
          minDist = d;
          closest = candidates[i];
        }
      }

      setNearestZone(closest);
      setDistanceToNearestKm(parseFloat(minDist.toFixed(1)));
    }
  }, [zones, cityFilter, timeOfDayFilter, riskFilter, userLocation]);

  const selectCity = (city: 'Mumbai' | 'Delhi') => {
    setCityFilter(city);
    if (city === 'Mumbai') {
      // Bandra Kurla Complex, Mumbai
      setUserLocation({
        latitude: 19.0657,
        longitude: 72.8643,
        accuracy: 5,
        timestamp: Date.now()
      });
    } else {
      // Connaught Place, Delhi
      setUserLocation({
        latitude: 28.6315,
        longitude: 77.2167,
        accuracy: 5,
        timestamp: Date.now()
      });
    }
  };

  const selectLocation = (zone: SafetyZone) => {
    setUserLocation({
      latitude: zone.center_lat,
      longitude: zone.center_lng,
      accuracy: 5,
      timestamp: Date.now()
    });
    setNearestZone(zone);
    setDistanceToNearestKm(0);
    if (zone.City !== cityFilter && cityFilter !== 'All') {
      setCityFilter(zone.City);
    }
  };

  const simulateLocation = (city: 'Mumbai' | 'Delhi') => {
    selectCity(city);
  };

  const refreshZones = async () => {
    await loadZones();
  };

  return (
    <SafetyContext.Provider
      value={{
        zones,
        filteredZones,
        isLoading,
        userLocation,
        nearestZone,
        distanceToNearestKm,
        cityFilter,
        timeOfDayFilter,
        riskFilter,
        setCityFilter,
        setTimeOfDayFilter,
        setRiskFilter,
        refreshZones,
        selectCity,
        simulateLocation,
        selectLocation
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => useContext(SafetyContext);

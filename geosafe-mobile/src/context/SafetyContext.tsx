import React, { createContext, useContext, useState, useEffect } from 'react';
import { SafetyZone, UserLocation, RiskCategory, TimeOfDay } from '../types';
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
  simulateLocation: (city: 'Mumbai' | 'Delhi') => void;
}

const SafetyContext = createContext<SafetyContextType>({} as SafetyContextType);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [filteredZones, setFilteredZones] = useState<SafetyZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Default initial location: Mumbai (Andheri West area)
  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: 19.1136,
    longitude: 72.8697,
    accuracy: 5,
    timestamp: Date.now()
  });

  const [nearestZone, setNearestZone] = useState<SafetyZone | null>(null);
  const [distanceToNearestKm, setDistanceToNearestKm] = useState<number>(0);

  const [cityFilter, setCityFilter] = useState<string>('All');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  // Load zones on startup
  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setIsLoading(true);
    try {
      const allZones = await safetyZoneService.getSafetyZones();
      setZones(allZones);
      setFilteredZones(allZones);
    } finally {
      setIsLoading(false);
    }
  };

  // Start continuous location tracking
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    locationService.startLocationStreaming((loc) => {
      setUserLocation(loc);
    }, 5000).then((unsub) => {
      cleanup = unsub;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Update nearest zone whenever user location or zones change
  useEffect(() => {
    if (zones.length === 0) return;

    safetyZoneService
      .findNearestZone(userLocation.latitude, userLocation.longitude)
      .then((res) => {
        if (res) {
          setNearestZone(res.zone);
          setDistanceToNearestKm(res.distanceKm);
        }
      });
  }, [userLocation, zones]);

  // Apply filters whenever filter criteria or zones change
  useEffect(() => {
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
  }, [zones, cityFilter, timeOfDayFilter, riskFilter]);

  const refreshZones = async () => {
    await loadZones();
  };

  const simulateLocation = (city: 'Mumbai' | 'Delhi') => {
    if (city === 'Mumbai') {
      // Bandra / Kurla Complex, Mumbai
      setUserLocation({
        latitude: 19.0600,
        longitude: 72.8680,
        accuracy: 5,
        timestamp: Date.now()
      });
    } else {
      // Connaught Place / Delhi Central
      setUserLocation({
        latitude: 28.6315,
        longitude: 77.2167,
        accuracy: 5,
        timestamp: Date.now()
      });
    }
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
        simulateLocation
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => useContext(SafetyContext);

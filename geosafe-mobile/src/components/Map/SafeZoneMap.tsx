import React from 'react';
import { Platform, DimensionValue } from 'react-native';
import { ActiveEmergency, SafetyZone, UserLocation } from '../../types';

interface SafeZoneMapProps {
  userLocation: UserLocation;
  zones: SafetyZone[];
  activeEmergency?: ActiveEmergency | null;
  onZoneSelect?: (zone: SafetyZone) => void;
  height?: DimensionValue;
  safeRouteWaypoints?: [number, number][];
  directRouteWaypoints?: [number, number][];
  selectedRouteId?: 'safe' | 'direct';
  originPoint?: { name: string; lat: number; lng: number };
  destinationPoint?: { name: string; lat: number; lng: number };
  mapStyle?: 'streets' | 'dark' | 'outdoor';
}

let MapImpl: React.ComponentType<SafeZoneMapProps>;

if (Platform.OS === 'web') {
  MapImpl = require('./SafeZoneMap.web').SafeZoneMap;
} else {
  MapImpl = require('./SafeZoneMap.native').SafeZoneMap;
}

export const SafeZoneMap: React.FC<SafeZoneMapProps> = (props) => {
  return <MapImpl {...props} />;
};

export default SafeZoneMap;

import React from 'react';
import { Platform, DimensionValue } from 'react-native';
import { SafetyZone, UserLocation, ActiveEmergency } from '../../types';

interface SafeZoneMapProps {
  userLocation: UserLocation;
  zones: SafetyZone[];
  activeEmergency?: ActiveEmergency | null;
  onZoneSelect?: (zone: SafetyZone) => void;
  height?: DimensionValue;
}

// Dynamically select web or native map
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

import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, DimensionValue } from 'react-native';
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { ActiveEmergency, SafetyZone, UserLocation } from '../../types';
import { safetyZoneService } from '../../services/SafetyZoneService';

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

export const SafeZoneMap: React.FC<SafeZoneMapProps> = ({
  userLocation,
  zones,
  activeEmergency,
  onZoneSelect,
  height = 450,
  safeRouteWaypoints,
  directRouteWaypoints,
  selectedRouteId = 'safe',
  originPoint,
  destinationPoint
}) => {
  const mapRef = useRef<MapView | null>(null);

  const recenter = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06
      }, 800);
    }
  };

  const safeCoords = (safeRouteWaypoints || []).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
  const directCoords = (directRouteWaypoints || []).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08
        }}
        showsUserLocation={false}
        showsCompass={true}
      >
        {/* User Location */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }}
          title="Current Position"
          pinColor="#2563EB"
        />

        {/* Zones */}
        {zones.map((zone, idx) => {
          const color = safetyZoneService.getRiskColor(zone.risk_category);
          const fillColor = safetyZoneService.getRiskFillColor(zone.risk_category);

          return (
            <React.Fragment key={zone.id || `${zone.City}-${zone.Location}-${zone.Time_of_Day}-${idx}`}>
              <Circle
                center={{
                  latitude: zone.center_lat,
                  longitude: zone.center_lng
                }}
                radius={1100}
                strokeColor={color}
                fillColor={fillColor}
                strokeWidth={1.5}
              />
              <Marker
                coordinate={{
                  latitude: zone.center_lat,
                  longitude: zone.center_lng
                }}
                title={`${zone.Location} (${zone.risk_category})`}
                description={`Score: ${zone.avg_risk_score.toFixed(1)}/5.0 | CCTV: ${zone.avg_cctv.toFixed(1)}`}
                onPress={() => onZoneSelect && onZoneSelect(zone)}
                pinColor={color}
              />
            </React.Fragment>
          );
        })}

        {activeEmergency?.status === 'ACTIVE' && (
          <Marker
            coordinate={{
              latitude: activeEmergency.current_lat,
              longitude: activeEmergency.current_lng
            }}
            title="Active SOS Emergency"
            description="Live emergency location"
            pinColor="#DC2626"
          />
        )}

        {/* Direct Route Polyline */}
        {directCoords.length > 1 && (
          <Polyline
            coordinates={directCoords}
            strokeColor={selectedRouteId === 'direct' ? '#EF4444' : '#F87171'}
            strokeWidth={selectedRouteId === 'direct' ? 5 : 3}
            lineDashPattern={[6, 6]}
          />
        )}

        {/* Safe AI Shield Route Polyline */}
        {safeCoords.length > 1 && (
          <Polyline
            coordinates={safeCoords}
            strokeColor={selectedRouteId === 'safe' ? '#10B981' : '#34D399'}
            strokeWidth={selectedRouteId === 'safe' ? 6 : 4}
          />
        )}

        {/* Origin Marker */}
        {originPoint && (
          <Marker
            coordinate={{ latitude: originPoint.lat, longitude: originPoint.lng }}
            title={`Start: ${originPoint.name}`}
            pinColor="#10B981"
          />
        )}

        {/* Destination Marker */}
        {destinationPoint && (
          <Marker
            coordinate={{ latitude: destinationPoint.lat, longitude: destinationPoint.lng }}
            title={`Destination: ${destinationPoint.name}`}
            pinColor="#6366F1"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.recenterButton} onPress={recenter} activeOpacity={0.8}>
        <Text style={styles.recenterText}>🎯 My GPS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative'
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  recenterButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000
  },
  recenterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A'
  }
});

export default SafeZoneMap;

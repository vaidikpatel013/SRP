import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, DimensionValue } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafetyZone, UserLocation, ActiveEmergency } from '../../types';
import { safetyZoneService } from '../../services/SafetyZoneService';

interface SafeZoneMapProps {
  userLocation: UserLocation;
  zones: SafetyZone[];
  activeEmergency?: ActiveEmergency | null;
  onZoneSelect?: (zone: SafetyZone) => void;
  height?: DimensionValue;
}

export const SafeZoneMap: React.FC<SafeZoneMapProps> = ({
  userLocation,
  zones,
  activeEmergency,
  onZoneSelect,
  height = 360
}) => {
  const mapRef = useRef<MapView | null>(null);

  const recenter = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      }, 800);
    }
  };

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
        {/* User Current Live Location Marker */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }}
          title="Your Location"
          description="Live GPS tracking active"
          pinColor="#2563EB"
        />

        {/* Safety Zone Circles & Markers */}
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
                radius={1200}
                strokeColor={color}
                fillColor={fillColor}
                strokeWidth={2}
              />
              <Marker
                coordinate={{
                  latitude: zone.center_lat,
                  longitude: zone.center_lng
                }}
                title={`${zone.Location} (${zone.risk_category})`}
                description={`Score: ${zone.avg_risk_score.toFixed(1)}/5.0 | CCTV: ${zone.avg_cctv.toFixed(1)} | Police: ${zone.avg_police_stations.toFixed(1)}`}
                onPress={() => onZoneSelect && onZoneSelect(zone)}
                pinColor={color}
              />
            </React.Fragment>
          );
        })}

        {/* Moving SOS Emergency Marker if Active */}
        {activeEmergency && activeEmergency.status === 'ACTIVE' && (
          <Marker
            coordinate={{
              latitude: activeEmergency.current_lat,
              longitude: activeEmergency.current_lng
            }}
            title="⚠️ ACTIVE SOS EMERGENCY"
            description="Continuous emergency coordinates streaming"
            pinColor="#DC2626"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.recenterButton} onPress={recenter} activeOpacity={0.8}>
        <Text style={styles.recenterText}>🎯 My Location</Text>
      </TouchableOpacity>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendLabel}>Low</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendLabel}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendLabel}>High</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
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
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000
  },
  recenterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937'
  },
  legendContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151'
  }
});

export default SafeZoneMap;

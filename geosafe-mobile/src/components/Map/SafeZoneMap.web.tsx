import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, DimensionValue } from 'react-native';
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const emergencyMarkerRef = useRef<any>(null);
  const circlesLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet CSS & JS for universal Web Map rendering
    const loadLeaflet = async () => {
      if ((window as any).L) {
        initMap();
        return;
      }

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.body.appendChild(script);
      } else {
        const checkL = setInterval(() => {
          if ((window as any).L) {
            clearInterval(checkL);
            initMap();
          }
        }, 100);
      }
    };

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || leafletMapRef.current) return;

      // Initialize map centered at user location
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([userLocation.latitude, userLocation.longitude], 12);

      // Add CartoDB Voyager / OpenStreetMap tiles (high quality modern clean map)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Create a layer group for circles
      const circlesGroup = L.layerGroup().addTo(map);
      circlesLayerRef.current = circlesGroup;

      // Custom pulsing blue marker for User Location
      const userIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: pulse 2s infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        zIndexOffset: 1000
      })
        .addTo(map)
        .bindPopup('<b>Your Live Location</b><br/>Continuous GPS Active');

      leafletMapRef.current = map;
      setMapLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update user marker position and center map
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !leafletMapRef.current || !userMarkerRef.current) return;

    userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
  }, [userLocation.latitude, userLocation.longitude]);

  // Render colored safety risk circles (Green = Low, Yellow = Moderate, Red = High)
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !leafletMapRef.current || !circlesLayerRef.current) return;

    circlesLayerRef.current.clearLayers();

    zones.forEach((zone) => {
      const color = safetyZoneService.getRiskColor(zone.risk_category);
      const fillColor = safetyZoneService.getRiskFillColor(zone.risk_category);

      const circle = L.circle([zone.center_lat, zone.center_lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.32,
        weight: 2,
        radius: 1200 // 1.2km radius per safety zone
      });

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 170px; padding: 4px 2px;">
          <div style="font-weight: 700; font-size: 15px; color: #111827;">${zone.Location}</div>
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 6px;">${zone.City} • ${zone.Time_of_Day}</div>
          <div style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${color}20; color: ${color}; margin-bottom: 8px;">
            ${zone.risk_category} (${zone.avg_risk_score.toFixed(1)}/5.0)
          </div>
          <div style="font-size: 11px; color: #374151; display: flex; flex-direction: column; gap: 2px;">
            <div>🎥 CCTV: <b>${zone.avg_cctv.toFixed(1)}</b></div>
            <div>🚓 Police Stations: <b>${zone.avg_police_stations.toFixed(1)}</b></div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);

      circle.on('click', () => {
        if (onZoneSelect) onZoneSelect(zone);
      });

      circlesLayerRef.current.addLayer(circle);
    });
  }, [zones, mapLoaded]);

  // Handle active emergency moving marker
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !leafletMapRef.current) return;

    if (activeEmergency && activeEmergency.status === 'ACTIVE') {
      const emergencyIcon = L.divIcon({
        className: 'emergency-sos-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: pulse 1s infinite;"></div>
            <div style="position: absolute; top: 6px; left: 6px; width: 20px; height: 20px; border-radius: 50%; background: #DC2626; border: 3px solid #FFFFFF; box-shadow: 0 3px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">SOS</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (!emergencyMarkerRef.current) {
        emergencyMarkerRef.current = L.marker(
          [activeEmergency.current_lat, activeEmergency.current_lng],
          { icon: emergencyIcon, zIndexOffset: 2000 }
        )
          .addTo(leafletMapRef.current)
          .bindPopup('<b>⚠️ LIVE SOS ACTIVE</b><br/>Emergency location streaming');
      } else {
        emergencyMarkerRef.current.setLatLng([
          activeEmergency.current_lat,
          activeEmergency.current_lng
        ]);
      }
    } else {
      if (emergencyMarkerRef.current) {
        emergencyMarkerRef.current.remove();
        emergencyMarkerRef.current = null;
      }
    }
  }, [activeEmergency]);

  const recenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* HTML container div for Web Leaflet */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}
      />

      {/* Recenter floating button */}
      <TouchableOpacity style={styles.recenterButton} onPress={recenter} activeOpacity={0.8}>
        <Text style={styles.recenterText}>🎯 My Location</Text>
      </TouchableOpacity>

      {/* Mini Legend overlay */}
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
    backgroundColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
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

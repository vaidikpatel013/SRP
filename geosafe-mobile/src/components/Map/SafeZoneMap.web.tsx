import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, DimensionValue } from 'react-native';
import { ActiveEmergency, SafetyZone, UserLocation } from '../../types';
import { safetyZoneService } from '../../services/SafetyZoneService';

const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAPTILER_API_KEY ?? '';

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
  destinationPoint,
  mapStyle = 'streets'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const circlesLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'streets' | 'dark' | 'outdoor'>(mapStyle);

  // Initialize Leaflet map with MapTiler
  useEffect(() => {
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
        const check = setInterval(() => {
          if ((window as any).L) {
            clearInterval(check);
            initMap();
          }
        }, 100);
      }
    };

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || leafletMapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([userLocation.latitude, userLocation.longitude], 12);

      // Add MapTiler Tile Layer
      const styleName = currentStyle === 'dark' ? 'dataviz-dark' : currentStyle === 'outdoor' ? 'outdoor-v2' : 'streets-v2';
      const tileUrl = `https://api.maptiler.com/maps/${styleName}/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;

      tileLayerRef.current = L.tileLayer(tileUrl, {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        maxZoom: 19,
        crossOrigin: true
      }).addTo(map);

      // Circles group
      circlesLayerRef.current = L.layerGroup().addTo(map);

      // Routes group
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Pulsing user location icon
      const userIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px;">
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: pulse 2s infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 14px; height: 14px; border-radius: 50%; background: #2563EB; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        zIndexOffset: 1000
      })
        .addTo(map)
        .bindPopup('<b>Current Position</b><br/>GPS Connected');

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

  // Update center when user location changes significantly
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !leafletMapRef.current || !userMarkerRef.current) return;

    userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    if (!safeRouteWaypoints && !directRouteWaypoints) {
      leafletMapRef.current.setView([userLocation.latitude, userLocation.longitude], 12);
    }
  }, [userLocation.latitude, userLocation.longitude]);

  // Update map style if changed
  const changeStyle = (newStyle: 'streets' | 'dark' | 'outdoor') => {
    const L = (window as any).L;
    if (!L || !leafletMapRef.current) return;

    setCurrentStyle(newStyle);
    if (tileLayerRef.current) {
      leafletMapRef.current.removeLayer(tileLayerRef.current);
    }
    const styleName = newStyle === 'dark' ? 'dataviz-dark' : newStyle === 'outdoor' ? 'outdoor-v2' : 'streets-v2';
    const tileUrl = `https://api.maptiler.com/maps/${styleName}/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;
    tileLayerRef.current = L.tileLayer(tileUrl, {
      tileSize: 512,
      zoomOffset: -1,
      minZoom: 1,
      maxZoom: 19,
      crossOrigin: true
    }).addTo(leafletMapRef.current);
  };

  // Render colored safety risk circles
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
        fillOpacity: 0.28,
        weight: 1.5,
        radius: 1100
      });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 175px; padding: 4px;">
          <div style="font-weight: 800; font-size: 15px; color: #0F172A;">${zone.Location}</div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 6px;">${zone.City} • ${zone.Time_of_Day} Interval</div>
          <div style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; background: ${color}22; color: ${color}; margin-bottom: 8px;">
            ${zone.risk_category} (${zone.avg_risk_score.toFixed(2)}/5.0)
          </div>
          <div style="font-size: 11px; color: #334155; display: flex; flex-direction: column; gap: 3px;">
            <div>🎥 CCTV Surveillance: <b>${zone.avg_cctv.toFixed(1)} cameras</b></div>
            <div>🚓 Police Stations: <b>${zone.avg_police_stations.toFixed(1)} stations</b></div>
            <div>📊 Crime Severity: <b>${(zone.avg_severity || 3.5).toFixed(1)}/10.0</b></div>
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

  // Render Routes (Safe AI Shield Route & Direct Route) and Waypoints
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !leafletMapRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Draw Direct Route (if available)
    if (directRouteWaypoints && directRouteWaypoints.length > 1) {
      const isSelected = selectedRouteId === 'direct';
      const directPolyline = L.polyline(directRouteWaypoints, {
        color: isSelected ? '#EF4444' : '#F87171',
        weight: isSelected ? 6 : 4,
        dashArray: '8, 8',
        opacity: isSelected ? 0.95 : 0.6
      }).bindPopup('<b>Direct Shortest Route</b><br/>High Risk Exposure Corridor');

      routeLayerRef.current.addLayer(directPolyline);
      directRouteWaypoints.forEach(pt => bounds.extend(pt));
    }

    // 2. Draw Safe Route (if available)
    if (safeRouteWaypoints && safeRouteWaypoints.length > 1) {
      const isSelected = selectedRouteId === 'safe';
      const safePolyline = L.polyline(safeRouteWaypoints, {
        color: isSelected ? '#10B981' : '#34D399',
        weight: isSelected ? 7 : 4,
        opacity: isSelected ? 1.0 : 0.65
      }).bindPopup('<b>🟢 GeoSafe AI Shield Route</b><br/>Verified Low-Risk Protected Corridor');

      routeLayerRef.current.addLayer(safePolyline);
      safeRouteWaypoints.forEach(pt => bounds.extend(pt));
    }

    // 3. Draw Origin Pin (A)
    if (originPoint) {
      const originIcon = L.divIcon({
        className: 'route-origin-pin',
        html: `
          <div style="background: #10B981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.35);">
            A
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const originMarker = L.marker([originPoint.lat, originPoint.lng], { icon: originIcon })
        .bindPopup(`<b>Origin (A):</b> ${originPoint.name}`);
      routeLayerRef.current.addLayer(originMarker);
      bounds.extend([originPoint.lat, originPoint.lng]);
    }

    // 4. Draw Destination Pin (B)
    if (destinationPoint) {
      const destIcon = L.divIcon({
        className: 'route-dest-pin',
        html: `
          <div style="background: #6366F1; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.35);">
            B
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const destMarker = L.marker([destinationPoint.lat, destinationPoint.lng], { icon: destIcon })
        .bindPopup(`<b>Destination (B):</b> ${destinationPoint.name}`);
      routeLayerRef.current.addLayer(destMarker);
      bounds.extend([destinationPoint.lat, destinationPoint.lng]);
    }

    if (activeEmergency?.status === 'ACTIVE') {
      const emergencyMarker = L.circleMarker(
        [activeEmergency.current_lat, activeEmergency.current_lng],
        {
          radius: 10,
          color: '#FFFFFF',
          weight: 3,
          fillColor: '#DC2626',
          fillOpacity: 1
        }
      ).bindPopup('<b>Active SOS Emergency</b><br/>Live emergency location');
      routeLayerRef.current.addLayer(emergencyMarker);
    }

    // Fit bounds smoothly to show complete route
    if (bounds.isValid() && (safeRouteWaypoints || directRouteWaypoints)) {
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [safeRouteWaypoints, directRouteWaypoints, selectedRouteId, originPoint, destinationPoint, activeEmergency, mapLoaded]);

  const recenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
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

      {/* Top Map Controls: Style Switcher & Recenter */}
      <View style={styles.topControlRow}>
        <View style={styles.styleButtonGroup}>
          <TouchableOpacity
            style={[styles.styleBtn, currentStyle === 'streets' && styles.styleBtnActive]}
            onPress={() => changeStyle('streets')}
          >
            <Text style={[styles.styleBtnText, currentStyle === 'streets' && styles.styleBtnTextActive]}>
              🗺️ Streets
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.styleBtn, currentStyle === 'dark' && styles.styleBtnActive]}
            onPress={() => changeStyle('dark')}
          >
            <Text style={[styles.styleBtnText, currentStyle === 'dark' && styles.styleBtnTextActive]}>
              🌙 Dark
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.recenterButton} onPress={recenter} activeOpacity={0.8}>
          <Text style={styles.recenterText}>🎯 My GPS</Text>
        </TouchableOpacity>
      </View>

      {/* MapTiler Attribution Badge */}
      <View style={styles.mapTilerBadge}>
        <Text style={styles.mapTilerBadgeText}>⚡ MapTiler Vector HD</Text>
      </View>

      {/* Risk Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendLabel}>Low Risk (&lt;2.3)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendLabel}>Moderate (2.3-3.5)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendLabel}>High Risk (&gt;3.5)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6
  },
  topControlRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000
  },
  styleButtonGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#334155'
  },
  styleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16
  },
  styleBtnActive: {
    backgroundColor: '#2563EB'
  },
  styleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8'
  },
  styleBtnTextActive: {
    color: '#FFFFFF'
  },
  recenterButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4
  },
  recenterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A'
  },
  mapTilerBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    zIndex: 1000
  },
  mapTilerBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38BDF8'
  },
  legendContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0'
  }
});

export default SafeZoneMap;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useSafety } from '../context/SafetyContext';
import { routingService, RouteCalculationResult, RouteOption } from '../services/RoutingService';
import { SafeZoneMap } from '../components/Map/SafeZoneMap';
import { TimeOfDay } from '../types';

export const RouteNavigatorScreen: React.FC = () => {
  const { cityFilter, selectCity, timeOfDayFilter, setTimeOfDayFilter, zones } = useSafety();

  const currentCity = cityFilter === 'All' ? 'Mumbai' : cityFilter;
  const cityLocations = zones
    .filter(z => z.City.toLowerCase() === currentCity.toLowerCase() && z.Time_of_Day === timeOfDayFilter)
    .map(z => z.Location);

  const uniqueLocations = Array.from(new Set(cityLocations));

  const [origin, setOrigin] = useState<string>(uniqueLocations[0] || 'Andheri West');
  const [destination, setDestination] = useState<string>(
    uniqueLocations[2] || uniqueLocations[1] || 'Colaba & Fort'
  );

  const [selectedRouteId, setSelectedRouteId] = useState<'safe' | 'direct'>('safe');
  const [routeResult, setRouteResult] = useState<RouteCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navProgress, setNavProgress] = useState<number>(0);

  // Update origin/destination when city changes
  useEffect(() => {
    if (uniqueLocations.length >= 2) {
      if (!uniqueLocations.includes(origin)) setOrigin(uniqueLocations[0]);
      if (!uniqueLocations.includes(destination)) setDestination(uniqueLocations[Math.min(2, uniqueLocations.length - 1)]);
    }
  }, [currentCity, timeOfDayFilter, zones]);

  // Calculate route whenever origin, destination, city, or time changes
  useEffect(() => {
    if (!origin || !destination) return;
    calculateRoute();
  }, [origin, destination, currentCity, timeOfDayFilter]);

  const calculateRoute = async () => {
    setIsCalculating(true);
    setIsNavigating(false);
    setNavProgress(0);
    try {
      const res = await routingService.calculateRoutes(
        origin,
        destination,
        currentCity,
        timeOfDayFilter as TimeOfDay
      );
      setRouteResult(res);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const startSimulation = () => {
    setIsNavigating(true);
    setNavProgress(0);
    const interval = setInterval(() => {
      setNavProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 600);
  };

  const activeRoute = routeResult
    ? selectedRouteId === 'safe'
      ? routeResult.safeRoute
      : routeResult.directRoute
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header & City Switcher */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeIcon}>🧭</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Safe Route Navigator</Text>
            <Text style={styles.headerSubtitle}>
              Risk-Meter Aware Directions & Crime Avoidance
            </Text>
          </View>
        </View>

        {/* City Toggle */}
        <View style={styles.cityPillGroup}>
          <TouchableOpacity
            style={[styles.cityPill, currentCity === 'Mumbai' && styles.cityPillActive]}
            onPress={() => selectCity('Mumbai')}
          >
            <Text style={[styles.cityPillText, currentCity === 'Mumbai' && styles.cityPillTextActive]}>
              🏙️ Mumbai
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cityPill, currentCity === 'Delhi' && styles.cityPillActive]}
            onPress={() => selectCity('Delhi')}
          >
            <Text style={[styles.cityPillText, currentCity === 'Delhi' && styles.cityPillTextActive]}>
              🏛️ Delhi
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Selector Panel */}
        <View style={styles.routeInputCard}>
          {/* Time of Day interval */}
          <View style={styles.timeFilterRow}>
            <Text style={styles.timeLabel}>Transit Interval:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['Night', 'Evening', 'Afternoon', 'Morning'] as const).map((tod) => (
                <TouchableOpacity
                  key={tod}
                  style={[styles.timeChip, timeOfDayFilter === tod && styles.timeChipActive]}
                  onPress={() => setTimeOfDayFilter(tod)}
                >
                  <Text style={[styles.timeChipText, timeOfDayFilter === tod && styles.timeChipTextActive]}>
                    {tod === 'Night' ? '🌙 Night (1.6x Risk)' : tod === 'Evening' ? '🌇 Evening' : tod}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Location Inputs with Swap Button */}
          <View style={styles.endpointsContainer}>
            <View style={styles.endpointsInputs}>
              {/* Point A: Origin */}
              <View style={styles.pointRow}>
                <View style={styles.pointDotOrigin} />
                <View style={styles.pointInputBox}>
                  <Text style={styles.pointInputLabel}>ORIGIN (POINT A)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
                    {uniqueLocations.map((loc) => (
                      <TouchableOpacity
                        key={`orig-${loc}`}
                        style={[styles.locPill, origin === loc && styles.locPillOriginActive]}
                        onPress={() => setOrigin(loc)}
                      >
                        <Text style={[styles.locPillText, origin === loc && styles.locPillTextActive]}>
                          {loc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.connectorLine} />

              {/* Point B: Destination */}
              <View style={styles.pointRow}>
                <View style={styles.pointDotDest} />
                <View style={styles.pointInputBox}>
                  <Text style={styles.pointInputLabel}>DESTINATION (POINT B)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
                    {uniqueLocations.map((loc) => (
                      <TouchableOpacity
                        key={`dest-${loc}`}
                        style={[styles.locPill, destination === loc && styles.locPillDestActive]}
                        onPress={() => setDestination(loc)}
                      >
                        <Text style={[styles.locPillText, destination === loc && styles.locPillTextActive]}>
                          {loc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Swap Button */}
            <TouchableOpacity style={styles.swapButton} onPress={handleSwap} activeOpacity={0.8}>
              <Text style={styles.swapIcon}>⇅</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Map with MapTiler & Route Polylines */}
        <View style={styles.mapContainer}>
          {routeResult && (
            <SafeZoneMap
              userLocation={{
                latitude: routeResult.origin.lat,
                longitude: routeResult.origin.lng
              }}
              zones={zones.filter(z => z.City.toLowerCase() === currentCity.toLowerCase())}
              safeRouteWaypoints={routeResult.safeRoute.waypoints}
              directRouteWaypoints={routeResult.directRoute.waypoints}
              selectedRouteId={selectedRouteId}
              originPoint={routeResult.origin}
              destinationPoint={routeResult.destination}
              height={380}
            />
          )}

          {isCalculating && (
            <View style={styles.calculatingOverlay}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.calculatingText}>Analyzing crime risk corridors...</Text>
            </View>
          )}
        </View>

        {/* Route Comparison Switcher (Safe Route vs Direct Route) */}
        {routeResult && (
          <View style={styles.routeCardsContainer}>
            <Text style={styles.sectionHeading}>Calculated Directions by Safety Risk Meter</Text>

            {/* Option 1: GeoSafe AI Shield Route (Safe) */}
            <TouchableOpacity
              style={[
                styles.routeCard,
                selectedRouteId === 'safe' && styles.routeCardSafeSelected
              ]}
              onPress={() => setSelectedRouteId('safe')}
              activeOpacity={0.9}
            >
              <View style={styles.routeCardTop}>
                <View style={styles.routeHeaderLeft}>
                  <View style={styles.safeBadge}>
                    <Text style={styles.safeBadgeText}>🟢 AI SHIELD ROUTE (SAFEST)</Text>
                  </View>
                  <Text style={styles.routeTitle}>{routeResult.safeRoute.title}</Text>
                  <Text style={styles.routeSub}>{routeResult.safeRoute.subtitle}</Text>
                </View>
                <View style={styles.scoreBoxSafe}>
                  <Text style={styles.scoreValueSafe}>{routeResult.safeRoute.avgRiskScore.toFixed(2)}</Text>
                  <Text style={styles.scoreScale}>/ 5.0 (Low Risk)</Text>
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={styles.routeMetricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{routeResult.safeRoute.totalDistanceKm} km</Text>
                  <Text style={styles.metricLbl}>Distance</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{routeResult.safeRoute.totalDurationMins} min</Text>
                  <Text style={styles.metricLbl}>Est. Duration</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#10B981' }]}>
                    🎥 {routeResult.safeRoute.totalCctv}
                  </Text>
                  <Text style={styles.metricLbl}>CCTV Density</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#38BDF8' }]}>
                    🚓 {routeResult.safeRoute.totalPoliceStations}
                  </Text>
                  <Text style={styles.metricLbl}>Police Stations</Text>
                </View>
              </View>

              {/* Safety exposure distribution bar */}
              <View style={styles.exposureBarContainer}>
                <View style={styles.exposureBarLabels}>
                  <Text style={styles.exposureLabel}>Safe Corridor Exposure:</Text>
                  <Text style={styles.exposurePercentSafe}>{routeResult.safeRoute.lowRiskPercent}% Low Risk</Text>
                </View>
                <View style={styles.exposureBarTrack}>
                  <View style={[styles.exposureBarFill, { width: `${routeResult.safeRoute.lowRiskPercent}%`, backgroundColor: '#10B981' }]} />
                  <View style={[styles.exposureBarFill, { width: `${routeResult.safeRoute.modRiskPercent}%`, backgroundColor: '#F59E0B' }]} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 2: Direct Shortest Route (High Risk) */}
            <TouchableOpacity
              style={[
                styles.routeCard,
                selectedRouteId === 'direct' && styles.routeCardDirectSelected
              ]}
              onPress={() => setSelectedRouteId('direct')}
              activeOpacity={0.9}
            >
              <View style={styles.routeCardTop}>
                <View style={styles.routeHeaderLeft}>
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningBadgeText}>🔴 DIRECT PATH (ELEVATED RISK)</Text>
                  </View>
                  <Text style={styles.routeTitle}>{routeResult.directRoute.title}</Text>
                  <Text style={styles.routeSub}>{routeResult.directRoute.subtitle}</Text>
                </View>
                <View style={styles.scoreBoxDirect}>
                  <Text style={styles.scoreValueDirect}>{routeResult.directRoute.avgRiskScore.toFixed(2)}</Text>
                  <Text style={styles.scoreScale}>/ 5.0 (High Risk)</Text>
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={styles.routeMetricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{routeResult.directRoute.totalDistanceKm} km</Text>
                  <Text style={styles.metricLbl}>Distance</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{routeResult.directRoute.totalDurationMins} min</Text>
                  <Text style={styles.metricLbl}>Est. Duration</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#EF4444' }]}>
                    🎥 {routeResult.directRoute.totalCctv}
                  </Text>
                  <Text style={styles.metricLbl}>CCTV Density</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#F59E0B' }]}>
                    🚓 {routeResult.directRoute.totalPoliceStations}
                  </Text>
                  <Text style={styles.metricLbl}>Police Stations</Text>
                </View>
              </View>

              {/* Warning list */}
              {routeResult.directRoute.warnings.map((warn, i) => (
                <View key={i} style={styles.warningRow}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>{warn}</Text>
                </View>
              ))}
            </TouchableOpacity>

            {/* Navigation Simulator Action Button */}
            <View style={styles.navActionSection}>
              {isNavigating ? (
                <View style={styles.activeNavBox}>
                  <View style={styles.activeNavHeader}>
                    <Text style={styles.activeNavTitle}>
                      🚀 Live Safe Guidance Active ({navProgress}%)
                    </Text>
                    <Text style={styles.activeNavSub}>
                      Passing {activeRoute?.title} • Continuous CCTV Shield Active
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${navProgress}%` }]} />
                  </View>
                  <TouchableOpacity
                    style={styles.stopNavButton}
                    onPress={() => setIsNavigating(false)}
                  >
                    <Text style={styles.stopNavText}>End Navigation</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.startNavButton,
                    selectedRouteId === 'safe' ? styles.startNavSafe : styles.startNavDirect
                  ]}
                  onPress={startSimulation}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startNavText}>
                    {selectedRouteId === 'safe'
                      ? '🛡️ Start Navigation with AI Safe Shield'
                      : '⚠️ Start Direct Navigation (Caution Advised)'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Turn-by-Turn Safety Breakdown Itinerary */}
            {activeRoute && (
              <View style={styles.itineraryCard}>
                <Text style={styles.itineraryHeading}>
                  Corridor Safety Waypoint Itinerary
                </Text>

                {activeRoute.segments.map((seg, idx) => (
                  <View key={idx} style={styles.segItem}>
                    <View style={styles.segLeft}>
                      <View
                        style={[
                          styles.segBadge,
                          {
                            backgroundColor:
                              seg.riskCategory === 'Low Risk'
                                ? '#10B981'
                                : seg.riskCategory === 'Moderate Risk'
                                ? '#F59E0B'
                                : '#EF4444'
                          }
                        ]}
                      >
                        <Text style={styles.segBadgeText}>{idx + 1}</Text>
                      </View>
                      {idx < activeRoute.segments.length - 1 && <View style={styles.segLine} />}
                    </View>

                    <View style={styles.segContent}>
                      <Text style={styles.segInstruction}>{seg.instruction}</Text>
                      <View style={styles.segMetaRow}>
                        <Text style={styles.segMetaText}>
                          {seg.distanceKm} km • {seg.durationMins} min • 🎥 {seg.cctvCount} CCTV
                        </Text>
                        <Text
                          style={[
                            styles.segRiskCategory,
                            {
                              color:
                                seg.riskCategory === 'Low Risk'
                                  ? '#10B981'
                                  : seg.riskCategory === 'Moderate Risk'
                                  ? '#F59E0B'
                                  : '#EF4444'
                            }
                          ]}
                        >
                          {seg.riskCategory} ({seg.riskScore.toFixed(2)})
                        </Text>
                      </View>
                      <Text style={styles.segSafetyTip}>{seg.safetyTip}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16'
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0B111E',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  brandBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandBadgeIcon: {
    fontSize: 22
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  cityPillGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  cityPillActive: {
    backgroundColor: '#2563EB'
  },
  cityPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8'
  },
  cityPillTextActive: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%'
  },
  routeInputCard: {
    backgroundColor: '#131B2E',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16
  },
  timeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8'
  },
  timeChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  timeChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#A78BFA'
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1'
  },
  timeChipTextActive: {
    color: '#FFFFFF'
  },
  endpointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  endpointsInputs: {
    flex: 1
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pointDotOrigin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  pointDotDest: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#334155',
    marginLeft: 5,
    marginVertical: 2
  },
  pointInputBox: {
    flex: 1
  },
  pointInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  locationScroll: {
    flexDirection: 'row'
  },
  locPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  locPillOriginActive: {
    backgroundColor: '#065F46',
    borderColor: '#10B981'
  },
  locPillDestActive: {
    backgroundColor: '#3730A3',
    borderColor: '#6366F1'
  },
  locPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8'
  },
  locPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center'
  },
  swapIcon: {
    fontSize: 20,
    color: '#38BDF8',
    fontWeight: 'bold'
  },
  mapContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 18,
    position: 'relative'
  },
  calculatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000
  },
  calculatingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700'
  },
  routeCardsContainer: {
    gap: 16
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4
  },
  routeCard: {
    backgroundColor: '#131B2E',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1E293B'
  },
  routeCardSafeSelected: {
    borderColor: '#10B981',
    backgroundColor: '#0D2129'
  },
  routeCardDirectSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#26131C'
  },
  routeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  routeHeaderLeft: {
    flex: 1
  },
  safeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#10B981'
  },
  safeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981'
  },
  warningBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  warningBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444'
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  routeSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2
  },
  scoreBoxSafe: {
    alignItems: 'flex-end'
  },
  scoreValueSafe: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981'
  },
  scoreBoxDirect: {
    alignItems: 'flex-end'
  },
  scoreValueDirect: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EF4444'
  },
  scoreScale: {
    fontSize: 10,
    color: '#94A3B8'
  },
  routeMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-between',
    marginBottom: 12
  },
  metricItem: {
    alignItems: 'center',
    flex: 1
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  metricLbl: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2
  },
  exposureBarContainer: {
    marginTop: 4
  },
  exposureBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  exposureLabel: {
    fontSize: 11,
    color: '#94A3B8'
  },
  exposurePercentSafe: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981'
  },
  exposureBarTrack: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  exposureBarFill: {
    height: '100%'
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  warningIcon: {
    fontSize: 12
  },
  warningText: {
    fontSize: 11,
    color: '#FCA5A5',
    flex: 1
  },
  navActionSection: {
    marginVertical: 4
  },
  startNavButton: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  startNavSafe: {
    backgroundColor: '#10B981'
  },
  startNavDirect: {
    backgroundColor: '#DC2626'
  },
  startNavText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  activeNavBox: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981'
  },
  activeNavHeader: {
    marginBottom: 10
  },
  activeNavTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981'
  },
  activeNavSub: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981'
  },
  stopNavButton: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  stopNavText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  itineraryCard: {
    backgroundColor: '#131B2E',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  itineraryHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14
  },
  segItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  segLeft: {
    alignItems: 'center',
    width: 24
  },
  segBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center'
  },
  segBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  segLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4
  },
  segContent: {
    flex: 1,
    paddingBottom: 14
  },
  segInstruction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4
  },
  segMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  segMetaText: {
    fontSize: 11,
    color: '#94A3B8'
  },
  segRiskCategory: {
    fontSize: 11,
    fontWeight: '700'
  },
  segSafetyTip: {
    fontSize: 11,
    color: '#38BDF8',
    fontStyle: 'italic'
  }
});

export default RouteNavigatorScreen;

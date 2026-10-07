import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useSafety } from '../context/SafetyContext';
import { SafeZoneMap } from '../components/Map/SafeZoneMap';
import { CurrentAreaRiskCard } from '../components/RiskCard/CurrentAreaRiskCard';
import { SafetyZone } from '../types';

interface ZoneExplorerScreenProps {
  onNavigateToNavigator?: (selectedLocation?: string) => void;
}

export const ZoneExplorerScreen: React.FC<ZoneExplorerScreenProps> = ({
  onNavigateToNavigator
}) => {
  const {
    zones,
    filteredZones,
    userLocation,
    nearestZone,
    distanceToNearestKm,
    cityFilter,
    selectCity,
    timeOfDayFilter,
    setTimeOfDayFilter,
    riskFilter,
    setRiskFilter,
    selectLocation
  } = useSafety();

  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedZone, setInspectedZone] = useState<SafetyZone | null>(null);

  const currentCity = cityFilter === 'All' ? 'Mumbai' : cityFilter;

  const displayZone = inspectedZone || nearestZone;

  // Search filter
  const searchResults = filteredZones.filter(z =>
    z.Location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleZoneSelect = (zone: SafetyZone) => {
    setInspectedZone(zone);
    selectLocation(zone);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeIcon}>🗺️</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Urban Safety Explorer</Text>
            <Text style={styles.headerSubtitle}>
              Interactive MapTiler Risk Zones & Infrastructure
            </Text>
          </View>
        </View>

        {/* City Toggle */}
        <View style={styles.cityPillGroup}>
          <TouchableOpacity
            style={[styles.cityPill, currentCity === 'Mumbai' && styles.cityPillActive]}
            onPress={() => {
              selectCity('Mumbai');
              setInspectedZone(null);
            }}
          >
            <Text style={[styles.cityPillText, currentCity === 'Mumbai' && styles.cityPillTextActive]}>
              🏙️ Mumbai
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cityPill, currentCity === 'Delhi' && styles.cityPillActive]}
            onPress={() => {
              selectCity('Delhi');
              setInspectedZone(null);
            }}
          >
            <Text style={[styles.cityPillText, currentCity === 'Delhi' && styles.cityPillTextActive]}>
              🏛️ Delhi
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar & Filter Controls */}
        <View style={styles.controlPanel}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${currentCity} (e.g. Bandra, BKC, Connaught Place)...`}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Time & Risk Filter Pills */}
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Time Filters */}
              {(['Night', 'Evening', 'Afternoon', 'Morning'] as const).map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.filterChip, timeOfDayFilter === time && styles.filterChipTimeActive]}
                  onPress={() => setTimeOfDayFilter(time)}
                >
                  <Text style={[styles.filterChipText, timeOfDayFilter === time && styles.filterChipTextActive]}>
                    {time === 'Night' ? '🌙 Night' : time === 'Evening' ? '🌇 Eve' : time}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.chipDivider} />

              {/* Risk Filters */}
              {(['All', 'Low Risk', 'Moderate Risk', 'High Risk'] as const).map((risk) => (
                <TouchableOpacity
                  key={risk}
                  style={[
                    styles.filterChip,
                    riskFilter === risk &&
                      (risk === 'Low Risk'
                        ? styles.filterChipLowActive
                        : risk === 'High Risk'
                        ? styles.filterChipHighActive
                        : styles.filterChipModActive)
                  ]}
                  onPress={() => setRiskFilter(risk)}
                >
                  <Text style={[styles.filterChipText, riskFilter === risk && styles.filterChipTextActive]}>
                    {risk === 'All' ? 'All Risks' : risk}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Interactive MapTiler Map */}
        <View style={styles.mapContainer}>
          <SafeZoneMap
            userLocation={userLocation}
            zones={searchResults}
            onZoneSelect={handleZoneSelect}
            height={440}
          />
        </View>

        {/* Floating / Active Inspected Area Risk Card */}
        <CurrentAreaRiskCard
          zone={displayZone}
          distanceKm={inspectedZone ? 0 : distanceToNearestKm}
        />

        {/* Quick Route Action CTA */}
        {displayZone && onNavigateToNavigator && (
          <View style={styles.routeCtaCard}>
            <View>
              <Text style={styles.routeCtaTitle}>Navigate with Risk Shield</Text>
              <Text style={styles.routeCtaSub}>
                Plan safety-optimized travel to or from {displayZone.Location}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.routeCtaButton}
              onPress={() => onNavigateToNavigator(displayZone.Location)}
              activeOpacity={0.8}
            >
              <Text style={styles.routeCtaButtonText}>Find Safe Route →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Location Grid */}
        <View style={styles.quickLocationsSection}>
          <Text style={styles.sectionHeading}>
            {currentCity} Safety Sectors ({searchResults.length} Analyzed)
          </Text>

          <View style={styles.locationsGrid}>
            {searchResults.map((zone, idx) => {
              const isSelected = displayZone?.Location === zone.Location;
              const color =
                zone.risk_category === 'Low Risk'
                  ? '#10B981'
                  : zone.risk_category === 'Moderate Risk'
                  ? '#F59E0B'
                  : '#EF4444';

              return (
                <TouchableOpacity
                  key={`${zone.City}-${zone.Location}-${idx}`}
                  style={[
                    styles.locationCard,
                    isSelected && styles.locationCardSelected
                  ]}
                  onPress={() => handleZoneSelect(zone)}
                  activeOpacity={0.8}
                >
                  <View style={styles.locationCardHeader}>
                    <Text style={styles.locationCardName}>{zone.Location}</Text>
                    <View style={[styles.miniBadge, { backgroundColor: `${color}20`, borderColor: color }]}>
                      <Text style={[styles.miniBadgeText, { color }]}>
                        {zone.avg_risk_score.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.locationCardMeta}>
                    {zone.risk_category} • {zone.Time_of_Day}
                  </Text>

                  <View style={styles.locationStatsRow}>
                    <Text style={styles.locationStatText}>🎥 {zone.avg_cctv.toFixed(1)} CCTV</Text>
                    <Text style={styles.locationStatText}>🚓 {zone.avg_police_stations.toFixed(1)} Police</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandBadgeIcon: {
    fontSize: 22
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF'
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
  controlPanel: {
    backgroundColor: '#131B2E',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#FFFFFF'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    padding: 4
  },
  clearSearchText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold'
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  filterChipTimeActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#A78BFA'
  },
  filterChipLowActive: {
    backgroundColor: '#065F46',
    borderColor: '#10B981'
  },
  filterChipModActive: {
    backgroundColor: '#92400E',
    borderColor: '#F59E0B'
  },
  filterChipHighActive: {
    backgroundColor: '#991B1B',
    borderColor: '#EF4444'
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1'
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  chipDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#334155',
    marginHorizontal: 8
  },
  mapContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16
  },
  routeCtaCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  routeCtaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  routeCtaSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    maxWidth: 260
  },
  routeCtaButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },
  routeCtaButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  quickLocationsSection: {
    marginTop: 8
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  locationCard: {
    width: '48.5%',
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  locationCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0F2338'
  },
  locationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  locationCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    paddingRight: 4
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  locationCardMeta: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 8
  },
  locationStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  locationStatText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '500'
  }
});

export default ZoneExplorerScreen;

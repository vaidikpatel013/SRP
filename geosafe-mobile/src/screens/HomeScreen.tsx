import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { useEmergency } from '../context/EmergencyContext';
import { SafeZoneMap } from '../components/Map/SafeZoneMap';
import { CurrentAreaRiskCard } from '../components/RiskCard/CurrentAreaRiskCard';
import { HoldForSOSButton } from '../components/SOS/HoldForSOSButton';
import { GuardianTrackingView } from '../components/Guardian/GuardianTrackingView';
import { SafetyZone } from '../types';

interface HomeScreenProps {
  onNavigateToAnalytics?: () => void;
  onNavigateToSettings?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToAnalytics,
  onNavigateToSettings
}) => {
  const { user } = useAuth();
  const {
    filteredZones,
    userLocation,
    nearestZone,
    distanceToNearestKm,
    cityFilter,
    timeOfDayFilter,
    setCityFilter,
    setTimeOfDayFilter,
    simulateLocation
  } = useSafety();

  const {
    scheduleFakeCall,
    cancelFakeCallTimer,
    fakeCallTimerRemaining,
    activeEmergencyData,
    activeEmergencyId
  } = useEmergency();

  const [guardianModalVisible, setGuardianModalVisible] = useState(false);
  const [fakeCallPickerVisible, setFakeCallPickerVisible] = useState(false);
  const [selectedMapZone, setSelectedMapZone] = useState<SafetyZone | null>(null);

  const displayZone = selectedMapZone || nearestZone;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeIcon}>🛡️</Text>
          </View>
          <View>
            <Text style={styles.appName}>GeoSafe</Text>
            <Text style={styles.userGreeting}>
              {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Real-Time Protection'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Quick Guardian Monitor Button */}
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setGuardianModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.headerIconText}>👥</Text>
          </TouchableOpacity>

          {/* Settings / Profile Button */}
          {onNavigateToSettings && (
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={onNavigateToSettings}
              activeOpacity={0.8}
            >
              <Text style={styles.headerIconText}>⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* City & Time-of-Day Quick Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {/* City Chips */}
            {(['All', 'Mumbai', 'Delhi'] as const).map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.filterChip, cityFilter === city && styles.filterChipActive]}
                onPress={() => setCityFilter(city)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    cityFilter === city && styles.filterChipTextActive
                  ]}
                >
                  {city === 'All' ? '🌐 All Cities' : city === 'Mumbai' ? '🏙️ Mumbai' : '🏛️ Delhi'}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Time of Day Chips */}
            {(['All', 'Morning', 'Afternoon', 'Evening', 'Night'] as const).map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.filterChip,
                  timeOfDayFilter === time && styles.filterChipTimeActive
                ]}
                onPress={() => setTimeOfDayFilter(time)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    timeOfDayFilter === time && styles.filterChipTextActive
                  ]}
                >
                  {time === 'Night' ? '🌙 Night' : time === 'Evening' ? '🌇 Eve' : time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Demo Location Jumper (Mumbai vs Delhi) */}
          <View style={styles.demoJumperRow}>
            <Text style={styles.demoJumperLabel}>Demo Jump:</Text>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => simulateLocation('Mumbai')}
            >
              <Text style={styles.demoPillText}>📍 Mumbai (Bandra)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => simulateLocation('Delhi')}
            >
              <Text style={styles.demoPillText}>📍 Delhi (CP)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Map Component */}
        <View style={styles.mapContainer}>
          <SafeZoneMap
            userLocation={userLocation}
            zones={filteredZones}
            activeEmergency={activeEmergencyData}
            onZoneSelect={(zone) => setSelectedMapZone(zone)}
            height={340}
          />
        </View>

        {/* Floating Current Area Risk Card */}
        <CurrentAreaRiskCard
          zone={displayZone}
          distanceKm={selectedMapZone ? undefined : distanceToNearestKm}
        />

        {/* Core Safety Utilities Section */}
        <View style={styles.utilitiesSection}>
          <Text style={styles.sectionTitle}>Rapid Response Utilities</Text>

          <View style={styles.utilityCardsRow}>
            {/* Fake Call Trigger Card */}
            <View style={styles.utilityCard}>
              <View style={styles.utilityCardTop}>
                <Text style={styles.utilityIcon}>📞</Text>
                <View style={styles.utilityTextContainer}>
                  <Text style={styles.utilityTitle}>Fake Incoming Call</Text>
                  <Text style={styles.utilitySub}>
                    {fakeCallTimerRemaining !== null
                      ? `Ringing in ${fakeCallTimerRemaining}s...`
                      : 'Simulate escape call'}
                  </Text>
                </View>
              </View>

              {fakeCallTimerRemaining !== null ? (
                <TouchableOpacity
                  style={styles.cancelCallButton}
                  onPress={cancelFakeCallTimer}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelCallText}>Cancel Call ({fakeCallTimerRemaining}s)</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.timerButtonGroup}>
                  <TouchableOpacity
                    style={styles.timerButton}
                    onPress={() => scheduleFakeCall(0)}
                  >
                    <Text style={styles.timerButtonText}>Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timerButton}
                    onPress={() => scheduleFakeCall(5)}
                  >
                    <Text style={styles.timerButtonText}>5s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timerButton}
                    onPress={() => scheduleFakeCall(10)}
                  >
                    <Text style={styles.timerButtonText}>10s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timerButton}
                    onPress={() => scheduleFakeCall(30)}
                  >
                    <Text style={styles.timerButtonText}>30s</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* One-Tap Guardian SOS Button with 5s Cancel Countdown */}
        <HoldForSOSButton onOpenGuardianTracker={() => setGuardianModalVisible(true)} />

        {/* Quick link to Safety Analytics Screen */}
        {onNavigateToAnalytics && (
          <TouchableOpacity
            style={styles.analyticsBanner}
            onPress={onNavigateToAnalytics}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.analyticsTitle}>📊 Urban Safety Analytics</Text>
              <Text style={styles.analyticsSub}>
                Explore Delhi & Mumbai incident severity, time-of-day weights, CCTV metrics
              </Text>
            </View>
            <Text style={styles.analyticsArrow}>→</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Guardian Real-Time Live Tracker Modal */}
      <Modal
        visible={guardianModalVisible}
        animationType="slide"
        onRequestClose={() => setGuardianModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <GuardianTrackingView
            emergencyId={activeEmergencyId}
            onClose={() => setGuardianModalVisible(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoBadgeIcon: {
    fontSize: 20
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  userGreeting: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  headerIconText: {
    fontSize: 18
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9'
  },
  scrollContent: {
    paddingBottom: 40
  },
  filterSection: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18
  },
  chipScroll: {
    marginBottom: 8
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA'
  },
  filterChipTimeActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#A78BFA'
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8'
  },
  filterChipTextActive: {
    color: '#FFFFFF'
  },
  demoJumperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  demoJumperLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  demoPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  demoPillText: {
    fontSize: 10,
    color: '#93C5FD',
    fontWeight: '600'
  },
  mapContainer: {
    paddingHorizontal: 16,
    marginTop: 12
  },
  utilitiesSection: {
    paddingHorizontal: 16,
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10
  },
  utilityCardsRow: {
    flexDirection: 'row',
    gap: 12
  },
  utilityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  utilityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  utilityIcon: {
    fontSize: 24
  },
  utilityTextContainer: {
    flex: 1
  },
  utilityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  utilitySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  timerButtonGroup: {
    flexDirection: 'row',
    gap: 6
  },
  timerButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  timerButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  cancelCallButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelCallText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  analyticsBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  analyticsTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  analyticsSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
    maxWidth: 280
  },
  analyticsArrow: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800'
  }
});

export default HomeScreen;

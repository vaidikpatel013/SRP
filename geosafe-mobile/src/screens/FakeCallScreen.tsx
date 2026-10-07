import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useEmergency } from '../context/EmergencyContext';

export const FakeCallScreen: React.FC = () => {
  const {
    scheduleFakeCall,
    cancelFakeCallTimer,
    fakeCallTimerRemaining,
    fakeCallSettings,
    updateFakeCallSettings
  } = useEmergency();

  const personas = [
    { name: 'Mom', number: '+91 98200 12345', icon: '👩' },
    { name: 'Dad', number: '+91 98111 22334', icon: '👨' },
    { name: 'Inspector Verma (Police)', number: '100 / Special Cell', icon: '👮' },
    { name: 'Cab Driver (Uber)', number: '+91 99000 55443', icon: '🚖' },
    { name: 'Dr. Mehta', number: '+91 98777 66554', icon: '🩺' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeIcon}>📞</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Fake Call Simulator</Text>
            <Text style={styles.headerSubtitle}>
              Discreet Non-Confrontational Escape Utility
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Timer Banner */}
        {fakeCallTimerRemaining !== null && (
          <View style={styles.timerBanner}>
            <View style={styles.timerPulse} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timerBannerTitle}>
                Call Scheduled in {fakeCallTimerRemaining} Seconds
              </Text>
              <Text style={styles.timerBannerSub}>
                Caller: {fakeCallSettings.callerName} ({fakeCallSettings.callerNumber})
              </Text>
            </View>
            <TouchableOpacity style={styles.cancelBannerBtn} onPress={cancelFakeCallTimer}>
              <Text style={styles.cancelBannerText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Launch Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏱️ Quick Delay Triggers</Text>
          <Text style={styles.cardSubtitle}>
            Simulate a realistic incoming cellular ring to gracefully exit uncomfortable situations
          </Text>

          <View style={styles.buttonGrid}>
            <TouchableOpacity
              style={[styles.delayButton, styles.delayButtonPrimary]}
              onPress={() => scheduleFakeCall(0)}
              activeOpacity={0.8}
            >
              <Text style={styles.delayIcon}>⚡</Text>
              <Text style={styles.delayText}>Trigger NOW</Text>
              <Text style={styles.delaySub}>Immediate Ring</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.delayButton}
              onPress={() => scheduleFakeCall(5)}
              activeOpacity={0.8}
            >
              <Text style={styles.delayIcon}>⏳</Text>
              <Text style={styles.delayText}>5 Seconds</Text>
              <Text style={styles.delaySub}>Pocket Trigger</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.delayButton}
              onPress={() => scheduleFakeCall(10)}
              activeOpacity={0.8}
            >
              <Text style={styles.delayIcon}>⏱️</Text>
              <Text style={styles.delayText}>10 Seconds</Text>
              <Text style={styles.delaySub}>Walk-Away Delay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.delayButton}
              onPress={() => scheduleFakeCall(30)}
              activeOpacity={0.8}
            >
              <Text style={styles.delayIcon}>🕒</Text>
              <Text style={styles.delayText}>30 Seconds</Text>
              <Text style={styles.delaySub}>Stealth Pre-set</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Caller Persona Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Select Caller Identity</Text>
          <Text style={styles.cardSubtitle}>
            Current Persona: <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>{fakeCallSettings.callerName}</Text> ({fakeCallSettings.callerNumber})
          </Text>

          <View style={styles.personaList}>
            {personas.map((p) => {
              const isSelected = fakeCallSettings.callerName === p.name;
              return (
                <TouchableOpacity
                  key={p.name}
                  style={[
                    styles.personaItem,
                    isSelected && styles.personaItemSelected
                  ]}
                  onPress={() =>
                    updateFakeCallSettings({ callerName: p.name, callerNumber: p.number })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.personaIcon}>{p.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personaName, isSelected && styles.personaNameSelected]}>
                      {p.name}
                    </Text>
                    <Text style={styles.personaNumber}>{p.number}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.activeCheck}>
                      <Text style={styles.checkText}>✓ Active</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tactical Guidance Box */}
        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceTitle}>💡 How This Protects You:</Text>
          <Text style={styles.guidanceText}>
            • Non-escalatory deterrence: An incoming call gives you a socially polite pretext to walk away, step into a well-lit establishment, or request public assistance without provoking an aggressor.{'\n'}
            • Full-screen takeover: Screen realistically mimics iOS/Android phone call with audio synthesis ({'\u0026'} vibration on mobile devices).
          </Text>
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
    borderBottomColor: '#1E293B'
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
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    gap: 16
  },
  timerBanner: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#3B82F6'
  },
  timerPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38BDF8'
  },
  timerBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  timerBannerSub: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2
  },
  cancelBannerBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  cancelBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  card: {
    backgroundColor: '#131B2E',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  delayButton: {
    width: '48.5%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  delayButtonPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA'
  },
  delayIcon: {
    fontSize: 26,
    marginBottom: 6
  },
  delayText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  delaySub: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2
  },
  personaList: {
    gap: 8
  },
  personaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D16',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12
  },
  personaItemSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0D223B'
  },
  personaIcon: {
    fontSize: 24
  },
  personaName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1'
  },
  personaNameSelected: {
    color: '#FFFFFF'
  },
  personaNumber: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  activeCheck: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  guidanceBox: {
    backgroundColor: '#0B132B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 6
  },
  guidanceText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18
  }
});

export default FakeCallScreen;

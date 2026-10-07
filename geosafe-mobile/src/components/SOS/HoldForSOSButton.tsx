import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable
} from 'react-native';
import { useEmergency } from '../../context/EmergencyContext';
import { useAuth } from '../../context/AuthContext';

interface HoldForSOSButtonProps {
  onOpenGuardianTracker?: () => void;
}

export const HoldForSOSButton: React.FC<HoldForSOSButtonProps> = ({
  onOpenGuardianTracker
}) => {
  const {
    isSosArmed,
    countdownSeconds,
    isSosActive,
    startSosCountdown,
    cancelSosCountdown,
    resolveEmergency,
    activeEmergencyId
  } = useEmergency();

  const { user } = useAuth();
  const [holding, setHolding] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isSosActive || isSosArmed) return;
    setHolding(true);
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    setHolding(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  const handleTrigger = () => {
    if (isSosActive) return;
    startSosCountdown();
  };

  return (
    <View style={styles.container}>
      {/* If Emergency is Active: Show Pulsing Alert Bar & Controls */}
      {isSosActive ? (
        <View style={styles.activeEmergencyCard}>
          <View style={styles.activeHeaderRow}>
            <View style={styles.pulsingDot} />
            <Text style={styles.activeAlertTitle}>
              EMERGENCY ACTIVE • LIVE GPS STREAMING
            </Text>
          </View>
          <Text style={styles.activeSubtitle}>
            Coordinates syncing to Guardian Cloud every 5s
            {activeEmergencyId && ` (ID: ${activeEmergencyId})`}
          </Text>

          <View style={styles.activeActionButtons}>
            {onOpenGuardianTracker && (
              <TouchableOpacity
                style={styles.guardianLinkButton}
                onPress={onOpenGuardianTracker}
                activeOpacity={0.8}
              >
                <Text style={styles.guardianLinkText}>👥 Guardian Live View</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.resolveButton}
              onPress={resolveEmergency}
              activeOpacity={0.8}
            >
              <Text style={styles.resolveButtonText}>✅ I AM SAFE (RESOLVE)</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Standby State: Prominent Red Hold for SOS Button */
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', alignItems: 'center' }}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleTrigger}
            style={styles.sosButton}
          >
            <View style={styles.sosInnerGlow}>
              <Text style={styles.sosIcon}>🚨</Text>
              <Text style={styles.sosMainText}>HOLD FOR SOS</Text>
              <Text style={styles.sosSubText}>Instant 5s Guardian Dispatch</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* 5-Second Cancel Countdown Modal */}
      <Modal
        visible={isSosArmed}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownCard}>
            <Text style={styles.countdownTitle}>DISPATCHING EMERGENCY SOS</Text>
            <Text style={styles.countdownNotice}>
              Vibrating feedback active. Alerting {user?.emergency_contact || 'emergency contacts'} & streaming live GPS coordinates in:
            </Text>

            <View style={styles.countdownCircle}>
              <Text style={styles.countdownNumber}>{countdownSeconds}</Text>
            </View>

            <TouchableOpacity
              style={styles.cancelCountdownButton}
              onPress={cancelSosCountdown}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelCountdownText}>TAP TO CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 12,
    alignItems: 'center'
  },
  sosButton: {
    width: '100%',
    maxWidth: 400,
    height: 80,
    backgroundColor: '#DC2626',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#F87171'
  },
  sosInnerGlow: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  sosIcon: {
    fontSize: 20,
    marginBottom: -2
  },
  sosMainText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  sosSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  activeEmergencyCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626'
  },
  activeAlertTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.5
  },
  activeSubtitle: {
    fontSize: 11,
    color: '#7F1D1D',
    marginBottom: 12,
    textAlign: 'center'
  },
  activeActionButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  guardianLinkButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center'
  },
  guardianLinkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  resolveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center'
  },
  resolveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12
  },
  countdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  countdownCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1F2937',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F87171',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8
  },
  countdownNotice: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    marginBottom: 24
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  cancelCountdownButton: {
    backgroundColor: '#374151',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563'
  },
  cancelCountdownText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1
  }
});

export default HoldForSOSButton;

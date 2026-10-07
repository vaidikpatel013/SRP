import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useEmergency } from '../../context/EmergencyContext';

export const FakeCallModal: React.FC = () => {
  const {
    isFakeCallIncoming,
    isFakeCallConnected,
    fakeCallSettings,
    acceptFakeCall,
    declineFakeCall
  } = useEmergency();

  const [callDuration, setCallDuration] = useState(0);

  // Timer counter for connected call
  useEffect(() => {
    let interval: any = null;
    if (isFakeCallConnected) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFakeCallConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isVisible = isFakeCallIncoming || isFakeCallConnected;

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

        {/* Top Caller Info */}
        <View style={styles.callerInfoContainer}>
          <Text style={styles.callTypeLabel}>
            {isFakeCallConnected ? 'Cellular Call Connected' : 'Incoming Call...'}
          </Text>
          <Text style={styles.callerName}>{fakeCallSettings.callerName}</Text>
          <Text style={styles.callerNumber}>
            {isFakeCallConnected ? formatDuration(callDuration) : fakeCallSettings.callerNumber}
          </Text>
        </View>

        {/* Caller Avatar / Graphic */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {fakeCallSettings.callerName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* In-Call Utility Grid (Active when Connected) */}
        {isFakeCallConnected ? (
          <View style={styles.inCallGrid}>
            <View style={styles.inCallGridRow}>
              <TouchableOpacity style={styles.utilityButton}>
                <Text style={styles.utilityIcon}>🔇</Text>
                <Text style={styles.utilityLabel}>Mute</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <Text style={styles.utilityIcon}>🔢</Text>
                <Text style={styles.utilityLabel}>Keypad</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <Text style={styles.utilityIcon}>🔊</Text>
                <Text style={styles.utilityLabel}>Speaker</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inCallGridRow}>
              <TouchableOpacity style={styles.utilityButton}>
                <Text style={styles.utilityIcon}>➕</Text>
                <Text style={styles.utilityLabel}>Add Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <Text style={styles.utilityIcon}>📹</Text>
                <Text style={styles.utilityLabel}>FaceTime</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <Text style={styles.utilityIcon}>👤</Text>
                <Text style={styles.utilityLabel}>Contacts</Text>
              </TouchableOpacity>
            </View>

            {/* End Call Button */}
            <View style={styles.endCallContainer}>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={declineFakeCall}
                activeOpacity={0.8}
              >
                <Text style={styles.callButtonIcon}>📞</Text>
              </TouchableOpacity>
              <Text style={styles.actionLabel}>End Call</Text>
            </View>
          </View>
        ) : (
          /* Incoming Call Actions: Accept & Decline */
          <View style={styles.actionsContainer}>
            <View style={styles.quickUtilitiesRow}>
              <TouchableOpacity style={styles.reminderButton}>
                <Text style={styles.reminderIcon}>⏰</Text>
                <Text style={styles.reminderLabel}>Remind Me</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reminderButton}>
                <Text style={styles.reminderIcon}>💬</Text>
                <Text style={styles.reminderLabel}>Message</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.callResponseRow}>
              {/* Decline Button */}
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={declineFakeCall}
                  activeOpacity={0.8}
                >
                  <Text style={styles.callButtonIcon}>📞</Text>
                </TouchableOpacity>
                <Text style={styles.actionLabel}>Decline</Text>
              </View>

              {/* Accept Button */}
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={acceptFakeCall}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.callButtonIcon, { transform: [{ rotate: '135deg' }] }]}>
                    📞
                  </Text>
                </TouchableOpacity>
                <Text style={styles.actionLabel}>Accept</Text>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24
  },
  callerInfoContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  callTypeLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 6
  },
  callerNumber: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '500'
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 30
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  avatarLetter: {
    color: '#E2E8F0',
    fontSize: 48,
    fontWeight: '800'
  },
  actionsContainer: {
    width: '100%',
    paddingBottom: 30
  },
  quickUtilitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40
  },
  reminderButton: {
    alignItems: 'center'
  },
  reminderIcon: {
    fontSize: 22,
    marginBottom: 4
  },
  reminderLabel: {
    color: '#94A3B8',
    fontSize: 12
  },
  callResponseRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  buttonWrapper: {
    alignItems: 'center'
  },
  declineButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  },
  acceptButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  },
  callButtonIcon: {
    fontSize: 32,
    color: '#FFFFFF'
  },
  actionLabel: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600'
  },
  inCallGrid: {
    width: '100%',
    paddingBottom: 20
  },
  inCallGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24
  },
  utilityButton: {
    alignItems: 'center',
    width: 70
  },
  utilityIcon: {
    fontSize: 26,
    marginBottom: 6
  },
  utilityLabel: {
    color: '#94A3B8',
    fontSize: 12
  },
  endCallContainer: {
    alignItems: 'center',
    marginTop: 16
  }
});

export default FakeCallModal;

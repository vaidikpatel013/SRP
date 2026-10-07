import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { isFirebaseConfigured } from '../config/firebase';

interface SettingsScreenProps {
  onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { user, updateProfile, logOut } = useAuth();
  const { fakeCallSettings, updateFakeCallSettings } = useEmergency();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '');

  const [callerName, setCallerName] = useState(fakeCallSettings.callerName);
  const [callerNumber, setCallerNumber] = useState(fakeCallSettings.callerNumber);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    await updateProfile(name, phone, emergencyContact);
    updateFakeCallSettings({ callerName, callerNumber });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    if (Platform.OS !== 'web') {
      Alert.alert('Settings Updated', 'Your emergency preferences have been successfully saved.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {savedSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Settings successfully updated!</Text>
          </View>
        )}

        {/* Cloud Connection Architecture Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cloud Backend Architecture</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isFirebaseConfigured() ? '#10B981' : '#F59E0B' }
              ]}
            />
            <Text style={styles.statusLabel}>
              {isFirebaseConfigured()
                ? 'Firebase Firestore & Cloud Auth: LIVE'
                : 'Offline Academic Dataset Mode (Active)'}
            </Text>
          </View>
          <Text style={styles.statusExplanation}>
            {isFirebaseConfigured()
              ? 'Real-time document synchronization active on collection "active_emergencies" and "safety_zones".'
              : 'Using bundled 80-zone pre-calculated Mumbai & Delhi spatial dataset with in-memory reactive real-time SOS streams.'}
          </Text>
        </View>

        {/* Emergency Contact Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Guardian Dispatch</Text>
          <Text style={styles.cardSubtitle}>
            Primary responder alerted upon 1-Tap SOS activation
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ananya Sharma"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Primary Guardian / Contact Phone *</Text>
            <TextInput
              style={[styles.input, { borderColor: '#EF4444' }]}
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="+91 91234 56789"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Fake Call Simulator Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fake Call Simulator Configuration</Text>
          <Text style={styles.cardSubtitle}>
            Customize the caller persona to deter harassment or discreetly exit danger
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Caller Display Name</Text>
            <TextInput
              style={styles.input}
              value={callerName}
              onChangeText={setCallerName}
              placeholder="Mom / Dad / Police / Home"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Caller Display Phone Number</Text>
            <TextInput
              style={styles.input}
              value={callerNumber}
              onChangeText={setCallerNumber}
              placeholder="+91 98200 12345"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          {/* Quick presets */}
          <Text style={styles.presetLabel}>Quick Persona Presets:</Text>
          <View style={styles.presetRow}>
            {['Mom', 'Dad', 'Inspector Verma', 'Cab Driver'].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={styles.presetPill}
                onPress={() => setCallerName(preset)}
              >
                <Text style={styles.presetText}>{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save All Settings</Text>
        </TouchableOpacity>

        {/* Academic Project Credits */}
        <View style={styles.academicFooter}>
          <Text style={styles.academicTitle}>GeoSafe Academic Project MVP</Text>
          <Text style={styles.academicDetails}>
            Urban Safety Analytics & Real-Time Emergency Response System{'\n'}
            Tech Stack: React Native (TypeScript), Expo, Firebase, Google Maps SDK{'\n'}
            Datasets: Mumbai & Delhi Ride Safety Geo-spatial Clusters
          </Text>
        </View>

        {/* Sign out */}
        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  backButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  backButtonText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 12
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16
  },
  successBanner: {
    backgroundColor: '#065F46',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  successText: {
    color: '#A7F3D0',
    fontWeight: '700',
    fontSize: 13
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 14
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 6
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  statusExplanation: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16
  },
  formGroup: {
    marginBottom: 12
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13
  },
  presetLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 6
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  presetPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  presetText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600'
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  academicFooter: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center'
  },
  academicTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 4
  },
  academicDetails: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700'
  }
});

export default SettingsScreen;

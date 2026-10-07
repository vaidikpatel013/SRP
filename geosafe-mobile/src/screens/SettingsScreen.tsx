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
import { useSafety } from '../context/SafetyContext';
import { useEmergency } from '../context/EmergencyContext';

export const SettingsScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { cityFilter, selectCity } = useSafety();
  const { fakeCallSettings, updateFakeCallSettings } = useEmergency();

  const [name, setName] = useState(user?.name || 'Ananya Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '+91 91234 56789');

  const [callerName, setCallerName] = useState(fakeCallSettings.callerName);
  const [callerNumber, setCallerNumber] = useState(fakeCallSettings.callerNumber);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const mapTilerConfigured = Boolean(process.env.EXPO_PUBLIC_MAPTILER_API_KEY);

  const handleSave = async () => {
    await updateProfile(name, phone, emergencyContact);
    updateFakeCallSettings({ callerName, callerNumber });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    if (Platform.OS !== 'web') {
      Alert.alert('Settings Updated', 'Preferences have been saved.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeIcon}>⚙️</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>System Preferences</Text>
            <Text style={styles.headerSubtitle}>
              MapTiler Engine, Default Metros & Profile
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {savedSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Preferences successfully saved!</Text>
          </View>
        )}

        {/* Map Engine & MapTiler API Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🗺️ MapTiler Engine Configuration</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, !mapTilerConfigured && styles.statusDotInactive]} />
            <Text style={styles.statusLabel}>
              MapTiler Cloud SDK: {mapTilerConfigured ? 'API key configured' : 'API key missing'}
            </Text>
          </View>
          <Text style={styles.statusExplanation}>
            Set EXPO_PUBLIC_MAPTILER_API_KEY in geosafe-mobile/.env to load map tiles. Do not commit the key.
          </Text>
        </View>

        {/* Default City Preference */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏙️ Default Metropolitan Hub</Text>
          <Text style={styles.cardSubtitle}>
            Active City: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{cityFilter}</Text>
          </Text>

          <View style={styles.cityButtonGroup}>
            <TouchableOpacity
              style={[styles.cityBtn, cityFilter === 'Mumbai' && styles.cityBtnActive]}
              onPress={() => selectCity('Mumbai')}
            >
              <Text style={styles.cityBtnIcon}>🏙️</Text>
              <Text style={styles.cityBtnText}>Mumbai Hub</Text>
              <Text style={styles.cityBtnSub}>Andheri, Bandra, BKC, Colaba</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cityBtn, cityFilter === 'Delhi' && styles.cityBtnActive]}
              onPress={() => selectCity('Delhi')}
            >
              <Text style={styles.cityBtnIcon}>🏛️</Text>
              <Text style={styles.cityBtnText}>Delhi NCR Hub</Text>
              <Text style={styles.cityBtnSub}>CP, Lajpat, Saket, Rohini</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 User Profile</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ananya Sharma"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>

        {/* Academic Project Credits */}
        <View style={styles.academicFooter}>
          <Text style={styles.academicTitle}>GeoSafe: Academic Final Year Project</Text>
          <Text style={styles.academicDetails}>
            Urban Safety Analytics & Real-Time Directions by Risk Meter{'\n'}
            Tech Stack: React Native, TypeScript, MapTiler Cloud SDK, Firebase{'\n'}
            Algorithms: Haversine Proximity, Diurnal Multiplier, Multi-Criteria Route Optimization
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
    borderColor: '#94A3B8',
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
    marginBottom: 14
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981'
  },
  statusDotInactive: {
    backgroundColor: '#F59E0B'
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  statusExplanation: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginTop: 4
  },
  cityButtonGroup: {
    flexDirection: 'row',
    gap: 12
  },
  cityBtn: {
    flex: 1,
    backgroundColor: '#090D16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center'
  },
  cityBtnActive: {
    borderColor: '#10B981',
    backgroundColor: '#07241A'
  },
  cityBtnIcon: {
    fontSize: 28,
    marginBottom: 6
  },
  cityBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  cityBtnSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center'
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
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  academicFooter: {
    backgroundColor: '#090D16',
    borderRadius: 14,
    padding: 16,
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
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16
  }
});

export default SettingsScreen;

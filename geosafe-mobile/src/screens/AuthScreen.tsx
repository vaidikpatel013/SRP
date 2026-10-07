import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { user, signInAnonymous, signInWithEmail, updateProfile, logOut } = useAuth();

  const [authMode, setAuthMode] = useState<'anonymous' | 'email'>('anonymous');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnonymousSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signInAnonymous();
    } catch (err: any) {
      setErrorMsg(err.message || 'Anonymous sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signInWithEmail(email, password, name, emergencyContact);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!emergencyContact.trim()) {
      setErrorMsg('Please specify an emergency contact number');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await updateProfile(name, phone, emergencyContact);
      if (Platform.OS !== 'web') {
        Alert.alert('Profile Saved', 'Emergency contact successfully configured.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed saving profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.brandIcon}>🛡️</Text>
          </View>
          <Text style={styles.appName}>GeoSafe</Text>
          <Text style={styles.tagline}>
            Urban Safety Analytics & Real-Time Emergency Response System
          </Text>
          <Text style={styles.academicSubtitle}>
            Final Year Academic Project • Mumbai & Delhi Crime Risk Models
          </Text>
        </View>

        {/* If user is already authenticated, show Profile Form */}
        {user ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Emergency Profile</Text>
              <Text style={styles.cardSubtitle}>
                Configure your emergency guardian contacts for rapid 1-tap dispatch
              </Text>
            </View>

            {errorMsg && <Text style={styles.errorText}>⚠️ {errorMsg}</Text>}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ananya Sharma"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Primary Emergency Contact Phone *</Text>
              <TextInput
                style={[styles.input, styles.highlightInput]}
                placeholder="+91 91234 56789 (Parent / Guardian)"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />
              <Text style={styles.helperText}>
                This contact receives automated SOS alerts and live GPS tracking links.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveProfile}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Save Emergency Profile</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={logOut}>
              <Text style={styles.secondaryButtonText}>Sign Out ({user.uid.substring(0, 8)}...)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Sign In Form */
          <View style={styles.card}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, authMode === 'anonymous' && styles.tabActive]}
                onPress={() => setAuthMode('anonymous')}
              >
                <Text
                  style={[
                    styles.tabText,
                    authMode === 'anonymous' && styles.tabTextActive
                  ]}
                >
                  Quick Demo Access
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, authMode === 'email' && styles.tabActive]}
                onPress={() => setAuthMode('email')}
              >
                <Text
                  style={[
                    styles.tabText,
                    authMode === 'email' && styles.tabTextActive
                  ]}
                >
                  Email / Password
                </Text>
              </TouchableOpacity>
            </View>

            {errorMsg && <Text style={styles.errorText}>⚠️ {errorMsg}</Text>}

            {authMode === 'anonymous' ? (
              <View style={styles.anonymousContainer}>
                <Text style={styles.anonymousDesc}>
                  Enter instantly without credentials. Perfect for testing, evaluation, and instant emergency dispatch.
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleAnonymousSignIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Enter GeoSafe as Guest</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emailFormContainer}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="user@geosafe.org"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Full Name (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ananya Sharma"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Emergency Contact Phone (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 91234 56789"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={emergencyContact}
                    onChangeText={setEmergencyContact}
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleEmailSignIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In / Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  brandIcon: {
    fontSize: 34
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  tagline: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320
  },
  academicSubtitle: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 6,
    fontWeight: '600'
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8
  },
  cardHeader: {
    marginBottom: 18
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  tabActive: {
    backgroundColor: '#2563EB'
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8'
  },
  tabTextActive: {
    color: '#FFFFFF'
  },
  anonymousContainer: {
    alignItems: 'center',
    paddingVertical: 8
  },
  anonymousDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  emailFormContainer: {
    gap: 14
  },
  formGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF'
  },
  highlightInput: {
    borderColor: '#EF4444',
    backgroundColor: '#181E30'
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500'
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center'
  }
});

export default AuthScreen;

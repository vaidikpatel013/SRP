import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SafetyProvider } from './src/context/SafetyContext';
import { EmergencyProvider } from './src/context/EmergencyContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SafetyAnalyticsScreen } from './src/screens/SafetyAnalyticsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { GuardianTrackingView } from './src/components/Guardian/GuardianTrackingView';
import { FakeCallModal } from './src/components/FakeCall/FakeCallModal';

type NavTab = 'home' | 'analytics' | 'guardian' | 'settings' | 'auth';

const MainNavigation: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  return (
    <View style={styles.appContainer}>
      {/* Active Screen View */}
      <View style={styles.screenContainer}>
        {currentTab === 'home' && (
          <HomeScreen
            onNavigateToAnalytics={() => setCurrentTab('analytics')}
            onNavigateToSettings={() => setCurrentTab('settings')}
          />
        )}
        {currentTab === 'analytics' && (
          <SafetyAnalyticsScreen onBack={() => setCurrentTab('home')} />
        )}
        {currentTab === 'guardian' && (
          <GuardianTrackingView onClose={() => setCurrentTab('home')} />
        )}
        {currentTab === 'settings' && (
          <SettingsScreen onBack={() => setCurrentTab('home')} />
        )}
        {currentTab === 'auth' && <AuthScreen />}
      </View>

      {/* Global Bottom Navigation Bar */}
      <SafeAreaView style={styles.bottomNavSafeArea}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navItem, currentTab === 'home' && styles.navItemActive]}
            onPress={() => setCurrentTab('home')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>🗺️</Text>
            <Text style={[styles.navLabel, currentTab === 'home' && styles.navLabelActive]}>
              Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentTab === 'analytics' && styles.navItemActive]}
            onPress={() => setCurrentTab('analytics')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>📊</Text>
            <Text style={[styles.navLabel, currentTab === 'analytics' && styles.navLabelActive]}>
              Analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentTab === 'guardian' && styles.navItemActive]}
            onPress={() => setCurrentTab('guardian')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>👥</Text>
            <Text style={[styles.navLabel, currentTab === 'guardian' && styles.navLabelActive]}>
              Guardian
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentTab === 'settings' && styles.navItemActive]}
            onPress={() => setCurrentTab('settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>⚙️</Text>
            <Text style={[styles.navLabel, currentTab === 'settings' && styles.navLabelActive]}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentTab === 'auth' && styles.navItemActive]}
            onPress={() => setCurrentTab('auth')}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>👤</Text>
            <Text style={[styles.navLabel, currentTab === 'auth' && styles.navLabelActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Global Incoming Fake Call Full-Screen Modal */}
      <FakeCallModal />
    </View>
  );
};

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width > 520;

  return (
    <AuthProvider>
      <SafetyProvider>
        <EmergencyProvider>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

          {/* If viewed on a large desktop monitor, render realistic smartphone bezel container */}
          {isDesktopWeb ? (
            <View style={styles.desktopCanvas}>
              <View style={styles.desktopDeviceFrame}>
                <View style={styles.speakerNotch} />
                <MainNavigation />
                <View style={styles.homeIndicator} />
              </View>
            </View>
          ) : (
            <View style={styles.rootContainer}>
              <MainNavigation />
            </View>
          )}
        </EmergencyProvider>
      </SafetyProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  desktopCanvas: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  desktopDeviceFrame: {
    width: 420,
    height: 860,
    backgroundColor: '#0F172A',
    borderRadius: 48,
    borderWidth: 8,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    position: 'relative'
  },
  speakerNotch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#334155',
    zIndex: 9999
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    zIndex: 9999
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  screenContainer: {
    flex: 1
  },
  bottomNavSafeArea: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B'
  },
  bottomNav: {
    flexDirection: 'row',
    height: 58,
    backgroundColor: '#0F172A',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
    flex: 1
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#38BDF8'
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B'
  },
  navLabelActive: {
    color: '#38BDF8'
  }
});

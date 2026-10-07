import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { SafetyProvider } from './src/context/SafetyContext';
import { EmergencyProvider } from './src/context/EmergencyContext';
import { RouteNavigatorScreen } from './src/screens/RouteNavigatorScreen';
import { ZoneExplorerScreen } from './src/screens/ZoneExplorerScreen';
import { SafetyAnalyticsScreen } from './src/screens/SafetyAnalyticsScreen';
import { FakeCallScreen } from './src/screens/FakeCallScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { FakeCallModal } from './src/components/FakeCall/FakeCallModal';

type NavTab = 'navigator' | 'explorer' | 'analytics' | 'fakecall' | 'settings';

const AppContent: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [currentTab, setCurrentTab] = useState<NavTab>('navigator');

  const navItems: { id: NavTab; label: string; icon: string; badge?: string }[] = [
    { id: 'navigator', label: 'Safe Navigation', icon: '🧭', badge: 'MAIN' },
    { id: 'explorer', label: 'Zone Explorer', icon: '🗺️' },
    { id: 'analytics', label: 'Crime Analytics', icon: '📊' },
    { id: 'fakecall', label: 'Fake Call', icon: '📞' },
    { id: 'settings', label: 'Preferences', icon: '⚙️' },
  ];

  return (
    <View style={styles.appShell}>
      <StatusBar barStyle="light-content" backgroundColor="#0B111E" />

      {/* Desktop Navigation Sidebar (>= 768px) */}
      {isDesktop && (
        <View style={styles.desktopSidebar}>
          {/* Brand Logo */}
          <View style={styles.sidebarBrand}>
            <View style={styles.sidebarLogoIcon}>
              <Text style={{ fontSize: 22 }}>🛡️</Text>
            </View>
            <View>
              <Text style={styles.sidebarTitle}>GeoSafe</Text>
              <Text style={styles.sidebarSub}>Risk-Aware Transit</Text>
            </View>
          </View>

          {/* Nav Items */}
          <View style={styles.sidebarNavList}>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sidebarNavItem, isActive && styles.sidebarNavItemActive]}
                  onPress={() => setCurrentTab(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sidebarNavIcon}>{item.icon}</Text>
                  <Text style={[styles.sidebarNavText, isActive && styles.sidebarNavTextActive]}>
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sidebar Footer */}
          <View style={styles.sidebarFooter}>
            <View style={styles.engineStatusRow}>
              <View style={styles.engineDot} />
              <Text style={styles.engineText}>MapTiler Engine Active</Text>
            </View>
            <Text style={styles.creditsText}>Mumbai & Delhi Safety Clusters</Text>
          </View>
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.mainViewport}>
        {currentTab === 'navigator' && <RouteNavigatorScreen />}
        {currentTab === 'explorer' && (
          <ZoneExplorerScreen onNavigateToNavigator={() => setCurrentTab('navigator')} />
        )}
        {currentTab === 'analytics' && <SafetyAnalyticsScreen />}
        {currentTab === 'fakecall' && <FakeCallScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      {!isDesktop && (
        <SafeAreaView style={styles.mobileBottomNavSafeArea}>
          <View style={styles.mobileBottomNav}>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.mobileNavItem, isActive && styles.mobileNavItemActive]}
                  onPress={() => setCurrentTab(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mobileNavIcon}>{item.icon}</Text>
                  <Text style={[styles.mobileNavLabel, isActive && styles.mobileNavLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      )}

      {/* Global Realistic Incoming Call Screen Modal */}
      <FakeCallModal />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafetyProvider>
        <EmergencyProvider>
          <AppContent />
        </EmergencyProvider>
      </SafetyProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#090D16',
    flexDirection: 'row'
  },
  desktopSidebar: {
    width: 250,
    backgroundColor: '#0B111E',
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    paddingVertical: 20,
    paddingHorizontal: 14,
    justifyContent: 'space-between'
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    marginBottom: 24
  },
  sidebarLogoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  sidebarSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  sidebarNavList: {
    gap: 8,
    flex: 1
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12
  },
  sidebarNavItemActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8'
  },
  sidebarNavIcon: {
    fontSize: 20
  },
  sidebarNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    flex: 1
  },
  sidebarNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  mainBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981'
  },
  mainBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#10B981'
  },
  sidebarFooter: {
    paddingHorizontal: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B'
  },
  engineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  engineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981'
  },
  engineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1'
  },
  creditsText: {
    fontSize: 10,
    color: '#64748B'
  },
  mainViewport: {
    flex: 1,
    backgroundColor: '#090D16'
  },
  mobileBottomNavSafeArea: {
    backgroundColor: '#0B111E',
    borderTopWidth: 1,
    borderTopColor: '#1E293B'
  },
  mobileBottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#0B111E',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  mobileNavItem: {
    alignItems: 'center',
    paddingVertical: 6,
    flex: 1
  },
  mobileNavItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#10B981'
  },
  mobileNavIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  mobileNavLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B'
  },
  mobileNavLabelActive: {
    color: '#10B981',
    fontWeight: '800'
  }
});

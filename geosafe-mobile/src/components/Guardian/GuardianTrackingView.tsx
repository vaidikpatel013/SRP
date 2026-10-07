import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking
} from 'react-native';
import { ActiveEmergency } from '../../types';
import { emergencyService } from '../../services/EmergencyService';
import { SafeZoneMap } from '../Map/SafeZoneMap';
import { useSafety } from '../../context/SafetyContext';

interface GuardianTrackingViewProps {
  emergencyId?: string | null;
  onClose?: () => void;
}

export const GuardianTrackingView: React.FC<GuardianTrackingViewProps> = ({
  emergencyId,
  onClose
}) => {
  const { zones } = useSafety();
  const [activeEmergencies, setActiveEmergencies] = useState<ActiveEmergency[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<ActiveEmergency | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Listen to all active emergencies
    const unsub = emergencyService.subscribeToActiveEmergencies((list) => {
      setActiveEmergencies(list);

      if (emergencyId) {
        const found = list.find(e => e.emergency_id === emergencyId);
        if (found) {
          setSelectedEmergency(found);
          return;
        }
      }

      if (list.length > 0 && !selectedEmergency) {
        setSelectedEmergency(list[0]);
      } else if (list.length === 0) {
        setSelectedEmergency(null);
      }
    });

    return unsub;
  }, [emergencyId]);

  // Keep selected emergency updated in real-time
  useEffect(() => {
    if (!selectedEmergency) return;
    const unsub = emergencyService.subscribeToEmergency(
      selectedEmergency.emergency_id,
      (updated) => {
        if (updated) {
          setSelectedEmergency(updated);
        }
      }
    );
    return unsub;
  }, [selectedEmergency?.emergency_id]);

  const handleShare = async () => {
    if (!selectedEmergency) return;
    const trackingUrl = `https://geosafe-response.app/track/${selectedEmergency.emergency_id}?lat=${selectedEmergency.current_lat}&lng=${selectedEmergency.current_lng}`;
    try {
      await Share.share({
        message: `🚨 GEOSAFE EMERGENCY ALERT: Immediate assistance requested. Live GPS Tracker: ${trackingUrl}`
      });
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {}
  };

  const handleCallEmergencyContact = () => {
    if (selectedEmergency?.emergency_contact) {
      Linking.openURL(`tel:${selectedEmergency.emergency_contact}`);
    } else if (selectedEmergency?.user_phone) {
      Linking.openURL(`tel:${selectedEmergency.user_phone}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Guardian Live Response</Text>
          <Text style={styles.headerSubtitle}>Real-Time GPS Emergency Stream</Text>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Emergency Selector Pill list if multiple emergencies exist */}
      {activeEmergencies.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {activeEmergencies.map((em) => (
            <TouchableOpacity
              key={em.emergency_id}
              style={[
                styles.selectorPill,
                selectedEmergency?.emergency_id === em.emergency_id && styles.selectorPillActive
              ]}
              onPress={() => setSelectedEmergency(em)}
            >
              <Text
                style={[
                  styles.selectorText,
                  selectedEmergency?.emergency_id === em.emergency_id && styles.selectorTextActive
                ]}
              >
                🚨 {em.user_name || em.emergency_id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedEmergency ? (
        <View style={styles.body}>
          {/* Status banner */}
          <View style={styles.statusBanner}>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.beaconDot} />
              <Text style={styles.liveBannerText}>
                {selectedEmergency.status === 'ACTIVE'
                  ? 'LIVE GPS TRACKING ACTIVE'
                  : 'EMERGENCY RESOLVED'}
              </Text>
            </View>
            <Text style={styles.timeUpdated}>
              Last update: {new Date().toLocaleTimeString()} (5s Interval)
            </Text>
          </View>

          {/* Victim Details Card */}
          <View style={styles.victimCard}>
            <View style={styles.victimRow}>
              <View>
                <Text style={styles.victimName}>{selectedEmergency.user_name || 'Protected User'}</Text>
                <Text style={styles.victimId}>ID: {selectedEmergency.emergency_id}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Text style={styles.shareButtonText}>{copiedLink ? '✓ Sent' : '🔗 Share Link'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coordsRow}>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <Text style={styles.coordValue}>{selectedEmergency.current_lat.toFixed(5)}°N</Text>
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <Text style={styles.coordValue}>{selectedEmergency.current_lng.toFixed(5)}°E</Text>
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>Updates</Text>
                <Text style={styles.coordValue}>
                  {selectedEmergency.history?.length || 1} pts
                </Text>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallEmergencyContact}
                activeOpacity={0.8}
              >
                <Text style={styles.callButtonText}>📞 Call Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => emergencyService.resolveEmergency(selectedEmergency.emergency_id)}
                activeOpacity={0.8}
              >
                <Text style={styles.resolveButtonText}>Mark Resolved</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Real-time Map with moving Emergency Marker */}
          <View style={styles.mapWrapper}>
            <Text style={styles.mapSectionTitle}>Tactical Map & Crime Zone Overlays</Text>
            <SafeZoneMap
              userLocation={{
                latitude: selectedEmergency.current_lat,
                longitude: selectedEmergency.current_lng
              }}
              zones={zones}
              activeEmergency={selectedEmergency}
              height={340}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>No Active Emergencies</Text>
          <Text style={styles.emptyText}>
            When a user triggers the HOLD FOR SOS button, their live location stream will instantly appear here for guardians and first responders.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  closeButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  closeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  selectorScroll: {
    marginBottom: 14
  },
  selectorPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  selectorPillActive: {
    backgroundColor: '#DC2626'
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  selectorTextActive: {
    color: '#FFFFFF'
  },
  body: {
    gap: 16
  },
  statusBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  beaconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626'
  },
  liveBannerText: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5
  },
  timeUpdated: {
    color: '#7F1D1D',
    fontSize: 11
  },
  victimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  victimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  victimName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  victimId: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  shareButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  shareButtonText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700'
  },
  coordsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 14
  },
  coordBox: {
    alignItems: 'center',
    flex: 1
  },
  coordLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  coordValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10
  },
  callButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  resolveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  resolveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  mapWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  mapSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginTop: 20
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20
  }
});

export default GuardianTrackingView;

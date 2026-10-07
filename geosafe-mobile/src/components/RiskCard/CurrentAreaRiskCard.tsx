import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafetyZone } from '../../types';
import { safetyZoneService } from '../../services/SafetyZoneService';

interface CurrentAreaRiskCardProps {
  zone: SafetyZone | null;
  distanceKm?: number;
  onRefresh?: () => void;
}

export const CurrentAreaRiskCard: React.FC<CurrentAreaRiskCardProps> = ({
  zone,
  distanceKm,
  onRefresh
}) => {
  if (!zone) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Analyzing regional safety metrics...</Text>
      </View>
    );
  }

  const riskColor = safetyZoneService.getRiskColor(zone.risk_category);
  const scorePercent = ((zone.avg_risk_score - 1) / 4) * 100;

  return (
    <View style={styles.card}>
      {/* Top Header: Location, City, and Live Distance */}
      <View style={styles.headerRow}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>{zone.Location}</Text>
          <Text style={styles.citySubtitle}>
            {zone.City} • {zone.Time_of_Day} Analysis
            {distanceKm !== undefined && ` • ${distanceKm.toFixed(1)} km`}
          </Text>
        </View>

        {/* Risk Badge */}
        <View style={[styles.badge, { backgroundColor: `${riskColor}18`, borderColor: riskColor }]}>
          <View style={[styles.badgeDot, { backgroundColor: riskColor }]} />
          <Text style={[styles.badgeText, { color: riskColor }]}>
            {zone.risk_category}
          </Text>
        </View>
      </View>

      {/* Score Bar Section */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Risk Index Score</Text>
          <Text style={[styles.scoreValue, { color: riskColor }]}>
            {zone.avg_risk_score.toFixed(2)}{' '}
            <Text style={styles.scoreMax}>/ 5.0</Text>
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(10, scorePercent))}%`, backgroundColor: riskColor }
            ]}
          />
        </View>
      </View>

      {/* Grid: CCTV & Police Station Count & Incident metrics */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🎥</Text>
          <View>
            <Text style={styles.statValue}>{zone.avg_cctv.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg CCTV</Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🚓</Text>
          <View>
            <Text style={styles.statValue}>{zone.avg_police_stations.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Police Stations</Text>
          </View>
        </View>

        {zone.total_incidents !== undefined && (
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📊</Text>
            <View>
              <Text style={styles.statValue}>{zone.total_incidents}</Text>
              <Text style={styles.statLabel}>Recorded Cases</Text>
            </View>
          </View>
        )}
      </View>

      {/* Safety advisory note based on risk score */}
      <View style={styles.footerNote}>
        <Text style={styles.advisoryText}>
          {zone.avg_risk_score > 3.2
            ? '⚠️ High caution advised after dark. Keep emergency contacts on speed dial.'
            : zone.avg_risk_score > 2.2
            ? 'ℹ️ Moderate risk density. Well-lit transit routes recommended.'
            : '✅ Safe zone. Optimal surveillance and rapid emergency service coverage.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  locationContainer: {
    flex: 1,
    paddingRight: 10
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  citySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  scoreSection: {
    marginBottom: 12
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6
  },
  scoreLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500'
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800'
  },
  scoreMax: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500'
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  statIcon: {
    fontSize: 20
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937'
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500'
  },
  footerNote: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8
  },
  advisoryText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
    fontStyle: 'italic'
  }
});

export default CurrentAreaRiskCard;

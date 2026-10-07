import 'package:flutter/material.dart';
import '../models/safety_zone.dart';

class CurrentAreaRiskCard extends StatelessWidget {
  final SafetyZone? zone;

  const CurrentAreaRiskCard({Key? key, required this.zone}) : super(key: key);

  Color _getRiskColor(String category) {
    switch (category) {
      case 'Low Risk':
        return const Color(0xFF10B981); // Green
      case 'Moderate Risk':
        return const Color(0xFFF59E0B); // Amber
      case 'High Risk':
        return const Color(0xFFEF4444); // Red
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (zone == null) {
      return Card(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        child: const Padding(
          padding: EdgeInsets.all(16.0),
          child: Text('Calculating localized risk metrics...'),
        ),
      );
    }

    final color = _getRiskColor(zone!.riskCategory);

    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      zone!.location,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${zone!.city} • ${zone!.timeOfDay}',
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: color),
                  ),
                  child: Text(
                    zone!.riskCategory,
                    style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Composite Risk Score:', style: TextStyle(fontSize: 13)),
                Text(
                  '${zone!.avgRiskScore.toStringAsFixed(2)} / 5.0',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: ((zone!.avgRiskScore - 1) / 4).clamp(0.0, 1.0),
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMetric('🎥', '${zone!.avgCctv.toStringAsFixed(1)}', 'Avg CCTV'),
                _buildMetric('🚓', '${zone!.avgPoliceStations.toStringAsFixed(1)}', 'Police Stations'),
                if (zone!.totalIncidents != null)
                  _buildMetric('📊', '${zone!.totalIncidents}', 'Incidents'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetric(String icon, String val, String label) {
    return Row(
      children: [
        Text(icon, style: const TextStyle(fontSize: 18)),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          ],
        ),
      ],
    );
  }
}

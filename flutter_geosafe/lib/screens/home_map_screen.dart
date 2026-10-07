import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import '../providers/safety_provider.dart';
import '../providers/emergency_provider.dart';
import '../widgets/current_area_risk_card.dart';
import '../widgets/hold_for_sos_button.dart';
import 'guardian_screen.dart';
import 'fake_call_screen.dart';

class HomeMapScreen extends StatefulWidget {
  const HomeMapScreen({Key? key}) : super(key: key);

  @override
  State<HomeMapScreen> createState() => _HomeMapScreenState();
}

class _HomeMapScreenState extends State<HomeMapScreen> {
  GoogleMapController? _mapController;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<SafetyProvider>(context, listen: false).loadZones();
    });
  }

  Color _getCategoryColor(String category) {
    if (category == 'Low Risk') return const Color(0xFF10B981);
    if (category == 'Moderate Risk') return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }

  Set<Circle> _buildCircles(SafetyProvider safety) {
    return safety.zones.map((z) {
      final color = _getCategoryColor(z.riskCategory);
      return Circle(
        circleId: CircleId('${z.city}_${z.location}_${z.timeOfDay}'),
        center: LatLng(z.centerLat, z.centerLng),
        radius: 1200,
        fillColor: color.withOpacity(0.3),
        strokeColor: color,
        strokeWidth: 2,
      );
    }).toSet();
  }

  Set<Marker> _buildMarkers(SafetyProvider safety, EmergencyProvider emergency) {
    final markers = <Marker>{};

    // User Location Marker
    markers.add(
      Marker(
        markerId: const MarkerId('user_location'),
        position: safety.userLocation,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        infoWindow: const InfoWindow(title: 'Your Location (Live GPS)'),
      ),
    );

    // Safety Zone Center Markers
    for (var z in safety.zones) {
      markers.add(
        Marker(
          markerId: MarkerId('zone_${z.location}_${z.timeOfDay}'),
          position: LatLng(z.centerLat, z.centerLng),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            z.riskCategory == 'High Risk'
                ? BitmapDescriptor.hueRed
                : z.riskCategory == 'Moderate Risk'
                    ? BitmapDescriptor.hueOrange
                    : BitmapDescriptor.hueGreen,
          ),
          infoWindow: InfoWindow(
            title: '${z.location} (${z.riskCategory})',
            snippet: 'Risk: ${z.avgRiskScore.toStringAsFixed(1)}/5.0 | CCTV: ${z.avgCctv.toStringAsFixed(1)}',
          ),
        ),
      );
    }

    return markers;
  }

  @override
  Widget build(BuildContext context) {
    final safety = Provider.of<SafetyProvider>(context);
    final emergency = Provider.of<EmergencyProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('GeoSafe: Urban Safety', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: const Icon(Icons.people_alt),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const GuardianScreen()),
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Google Map View
          GoogleMap(
            initialCameraPosition: CameraPosition(target: safety.userLocation, zoom: 12),
            onMapCreated: (c) => _mapController = c,
            circles: _buildCircles(safety),
            markers: _buildMarkers(safety, emergency),
            myLocationEnabled: false,
            zoomControlsEnabled: false,
          ),

          // Top City & Time-of-Day Filter Chips
          Positioned(
            top: 10,
            left: 10,
            right: 10,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All Cities', safety.cityFilter == 'All', () => safety.setCityFilter('All')),
                  _buildFilterChip('Mumbai', safety.cityFilter == 'Mumbai', () => safety.setCityFilter('Mumbai')),
                  _buildFilterChip('Delhi', safety.cityFilter == 'Delhi', () => safety.setCityFilter('Delhi')),
                  const SizedBox(width: 8),
                  _buildFilterChip('All Times', safety.timeFilter == 'All', () => safety.setTimeFilter('All')),
                  _buildFilterChip('Night', safety.timeFilter == 'Night', () => safety.setTimeFilter('Night')),
                ],
              ),
            ),
          ),

          // Bottom Controls: Risk Card, Fake Call, Hold For SOS
          Positioned(
            bottom: 10,
            left: 0,
            right: 0,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CurrentAreaRiskCard(zone: safety.nearestZone),
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const FakeCallScreen()),
                            );
                          },
                          icon: const Icon(Icons.phone_in_talk, color: Colors.white, size: 18),
                          label: const Text('Fake Call', style: TextStyle(color: Colors.white)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E293B),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                HoldForSOSButton(
                  onOpenGuardian: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const GuardianScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label, style: TextStyle(color: isSelected ? Colors.white : Colors.black87, fontSize: 11)),
        selected: isSelected,
        selectedColor: const Color(0xFF2563EB),
        backgroundColor: Colors.white.withOpacity(0.9),
        onSelected: (_) => onTap(),
      ),
    );
  }
}

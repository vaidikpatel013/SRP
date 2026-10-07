import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../services/emergency_service.dart';
import '../models/active_emergency.dart';

class GuardianScreen extends StatefulWidget {
  const GuardianScreen({Key? key}) : super(key: key);

  @override
  State<GuardianScreen> createState() => _GuardianScreenState();
}

class _GuardianScreenState extends State<GuardianScreen> {
  final EmergencyService _emergencyService = EmergencyService();
  GoogleMapController? _mapController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Guardian Live Stream'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: StreamBuilder<List<ActiveEmergency>>(
        stream: _emergencyService.streamActiveEmergencies(),
        builder: (context, snapshot) {
          final emergencies = snapshot.data ?? [];

          if (emergencies.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: Text(
                  'No active emergencies currently streaming.\nWhen a user triggers SOS, their moving marker will appear here.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey, fontSize: 14),
                ),
              ),
            );
          }

          final active = emergencies.first;
          final target = LatLng(active.currentLat, active.currentLng);

          return Column(
            children: [
              Container(
                color: Colors.red[50],
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const Icon(Icons.emergency, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'LIVE SOS: ${active.userName ?? "User"} (${active.emergencyId})',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: GoogleMap(
                  initialCameraPosition: CameraPosition(target: target, zoom: 14),
                  onMapCreated: (c) => _mapController = c,
                  markers: {
                    Marker(
                      markerId: MarkerId(active.emergencyId),
                      position: target,
                      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
                      infoWindow: InfoWindow(title: 'Victim Location: ${active.userName}'),
                    ),
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: ElevatedButton(
                  onPressed: () {
                    _emergencyService.resolveEmergency(active.emergencyId);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    minimumSize: const Size.fromHeight(48),
                  ),
                  child: const Text('Mark Emergency as Resolved', style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

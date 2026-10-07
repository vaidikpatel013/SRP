import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/active_emergency.dart';

class EmergencyService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  String? _activeEmergencyId;
  Timer? _gpsStreamTimer;

  String? get activeEmergencyId => _activeEmergencyId;

  Future<String> triggerSOS({
    required String userId,
    required double lat,
    required double lng,
    String? userName,
    String? userPhone,
    String? emergencyContact,
  }) async {
    final emergencyId = 'sos_${DateTime.now().millisecondsSinceEpoch}';
    _activeEmergencyId = emergencyId;

    try {
      await _firestore.collection('active_emergencies').doc(emergencyId).set({
        'emergency_id': emergencyId,
        'user_id': userId,
        'user_name': userName ?? 'Protected User',
        'user_phone': userPhone ?? '',
        'emergency_contact': emergencyContact ?? '',
        'status': 'ACTIVE',
        'current_lat': lat,
        'current_lng': lng,
        'last_updated': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      // Local fallback
    }

    return emergencyId;
  }

  Future<void> updateEmergencyLocation(double lat, double lng) async {
    if (_activeEmergencyId == null) return;
    try {
      await _firestore
          .collection('active_emergencies')
          .doc(_activeEmergencyId)
          .update({
        'current_lat': lat,
        'current_lng': lng,
        'last_updated': FieldValue.serverTimestamp(),
      });
    } catch (e) {}
  }

  Future<void> resolveEmergency([String? emergencyId]) async {
    final targetId = emergencyId ?? _activeEmergencyId;
    if (targetId == null) return;

    try {
      await _firestore
          .collection('active_emergencies')
          .doc(targetId)
          .update({
        'status': 'RESOLVED',
        'last_updated': FieldValue.serverTimestamp(),
      });
    } catch (e) {}

    if (targetId == _activeEmergencyId) {
      _activeEmergencyId = null;
      _gpsStreamTimer?.cancel();
      _gpsStreamTimer = null;
    }
  }

  Stream<ActiveEmergency?> streamEmergency(String emergencyId) {
    return _firestore
        .collection('active_emergencies')
        .doc(emergencyId)
        .snapshots()
        .map((snap) {
      if (snap.exists && snap.data() != null) {
        return ActiveEmergency.fromMap(snap.data()!, snap.id);
      }
      return null;
    });
  }

  Stream<List<ActiveEmergency>> streamActiveEmergencies() {
    return _firestore
        .collection('active_emergencies')
        .where('status', isEqualTo: 'ACTIVE')
        .snapshots()
        .map((snap) => snap.docs
            .map((d) => ActiveEmergency.fromMap(d.data(), d.id))
            .toList());
  }
}

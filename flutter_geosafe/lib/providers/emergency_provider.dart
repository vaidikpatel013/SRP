import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:vibration/vibration.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../services/emergency_service.dart';

class EmergencyProvider with ChangeNotifier {
  final EmergencyService _service = EmergencyService();

  bool _isSosArmed = false;
  int _countdownSeconds = 5;
  bool _isSosActive = false;
  String? _activeEmergencyId;
  Timer? _countdownTimer;
  Timer? _streamTimer;

  bool get isSosArmed => _isSosArmed;
  int get countdownSeconds => _countdownSeconds;
  bool get isSosActive => _isSosActive;
  String? get activeEmergencyId => _activeEmergencyId;

  void startSosCountdown({
    required String userId,
    required LatLng location,
    String? userName,
    String? emergencyContact,
  }) {
    if (_isSosActive || _isSosArmed) return;

    _isSosArmed = true;
    _countdownSeconds = 5;
    notifyListeners();

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      _countdownSeconds--;
      notifyListeners();

      // Trigger vibration feedback
      try {
        if (await Vibration.hasVibrator() ?? false) {
          Vibration.vibrate(duration: 300);
        }
      } catch (e) {}

      if (_countdownSeconds <= 0) {
        timer.cancel();
        _countdownTimer = null;
        _isSosArmed = false;
        await triggerSosImmediate(
          userId: userId,
          location: location,
          userName: userName,
          emergencyContact: emergencyContact,
        );
      }
    });
  }

  void cancelSosCountdown() {
    _countdownTimer?.cancel();
    _countdownTimer = null;
    _isSosArmed = false;
    _countdownSeconds = 5;
    notifyListeners();
  }

  Future<void> triggerSosImmediate({
    required String userId,
    required LatLng location,
    String? userName,
    String? emergencyContact,
  }) async {
    cancelSosCountdown();
    _activeEmergencyId = await _service.triggerSOS(
      userId: userId,
      lat: location.latitude,
      lng: location.longitude,
      userName: userName,
      emergencyContact: emergencyContact,
    );
    _isSosActive = true;
    notifyListeners();

    // Stream GPS updates every 5 seconds
    _streamTimer?.cancel();
    _streamTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _service.updateEmergencyLocation(location.latitude, location.longitude);
    });
  }

  Future<void> resolveEmergency() async {
    _streamTimer?.cancel();
    _streamTimer = null;
    if (_activeEmergencyId != null) {
      await _service.resolveEmergency(_activeEmergencyId);
    }
    _isSosActive = false;
    _activeEmergencyId = null;
    notifyListeners();
  }
}

import 'package:flutter/foundation.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/safety_zone.dart';
import '../services/safety_zone_service.dart';

class SafetyProvider with ChangeNotifier {
  final SafetyZoneService _service = SafetyZoneService();

  List<SafetyZone> _zones = [];
  List<SafetyZone> _filteredZones = [];
  SafetyZone? _nearestZone;
  LatLng _userLocation = const LatLng(19.0760, 72.8777); // Default Mumbai
  String _cityFilter = 'All';
  String _timeFilter = 'All';
  bool _isLoading = true;

  List<SafetyZone> get zones => _filteredZones;
  SafetyZone? get nearestZone => _nearestZone;
  LatLng get userLocation => _userLocation;
  String get cityFilter => _cityFilter;
  String get timeFilter => _timeFilter;
  bool get isLoading => _isLoading;

  Future<void> loadZones() async {
    _isLoading = true;
    notifyListeners();

    _zones = await _service.getSafetyZones();
    _applyFilters();
    await updateNearestZone();

    _isLoading = false;
    notifyListeners();
  }

  void setLocation(LatLng newLoc) {
    _userLocation = newLoc;
    updateNearestZone();
    notifyListeners();
  }

  void setCityFilter(String city) {
    _cityFilter = city;
    _applyFilters();
    notifyListeners();
  }

  void setTimeFilter(String time) {
    _timeFilter = time;
    _applyFilters();
    notifyListeners();
  }

  void _applyFilters() {
    _filteredZones = _zones.where((z) {
      if (_cityFilter != 'All' && z.city.toLowerCase() != _cityFilter.toLowerCase()) return false;
      if (_timeFilter != 'All' && z.timeOfDay.toLowerCase() != _timeFilter.toLowerCase()) return false;
      return true;
    }).toList();
  }

  Future<void> updateNearestZone() async {
    _nearestZone = await _service.findNearestZone(_userLocation.latitude, _userLocation.longitude);
    notifyListeners();
  }
}

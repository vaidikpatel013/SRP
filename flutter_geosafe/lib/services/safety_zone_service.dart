import 'dart:convert';
import 'dart:math';
import 'package:flutter/services.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/safety_zone.dart';

class SafetyZoneService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  List<SafetyZone> _cachedZones = [];

  Future<List<SafetyZone>> getSafetyZones({bool forceRefresh = false}) async {
    if (_cachedZones.isNotEmpty && !forceRefresh) {
      return _cachedZones;
    }

    try {
      final snapshot = await _firestore.collection('safety_zones').get();
      if (snapshot.docs.isNotEmpty) {
        _cachedZones = snapshot.docs
            .map((doc) => SafetyZone.fromJson(doc.data(), doc.id))
            .toList();
        return _cachedZones;
      }
    } catch (e) {
      // Fallback to local asset bundle
    }

    // Load bundled dataset
    final jsonString = await rootBundle.loadString('assets/safety_zones.json');
    final List<dynamic> jsonList = jsonDecode(jsonString);
    _cachedZones = jsonList.map((j) => SafetyZone.fromJson(j)).toList();
    return _cachedZones;
  }

  double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
    const r = 6371; // Earth radius in km
    final dLat = (lat2 - lat1) * (pi / 180.0);
    final dLon = (lon2 - lon1) * (pi / 180.0);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * (pi / 180.0)) * cos(lat2 * (pi / 180.0)) * sin(dLon / 2) * sin(dLon / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return r * c;
  }

  Future<SafetyZone?> findNearestZone(double lat, double lng) async {
    final zones = await getSafetyZones();
    if (zones.isEmpty) return null;

    SafetyZone nearest = zones.first;
    double minDistance = calculateDistanceKm(lat, lng, nearest.centerLat, nearest.centerLng);

    for (var z in zones.skip(1)) {
      final dist = calculateDistanceKm(lat, lng, z.centerLat, z.centerLng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = z;
      }
    }

    return nearest;
  }
}

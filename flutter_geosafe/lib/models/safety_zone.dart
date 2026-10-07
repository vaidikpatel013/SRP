class SafetyZone {
  final String? id;
  final String city;
  final String location;
  final String timeOfDay;
  final double avgRiskScore;
  final String riskCategory;
  final double centerLat;
  final double centerLng;
  final double avgCctv;
  final double avgPoliceStations;
  final int? totalIncidents;
  final double? avgSeverity;

  SafetyZone({
    this.id,
    required this.city,
    required this.location,
    required this.timeOfDay,
    required this.avgRiskScore,
    required this.riskCategory,
    required this.centerLat,
    required this.centerLng,
    required this.avgCctv,
    required this.avgPoliceStations,
    this.totalIncidents,
    this.avgSeverity,
  });

  factory SafetyZone.fromJson(Map<String, dynamic> json, [String? docId]) {
    return SafetyZone(
      id: docId,
      city: json['City'] ?? json['city'] ?? '',
      location: json['Location'] ?? json['location'] ?? '',
      timeOfDay: json['Time_of_Day'] ?? json['timeOfDay'] ?? 'Night',
      avgRiskScore: (json['avg_risk_score'] ?? json['avgRiskScore'] ?? 1.0).toDouble(),
      riskCategory: json['risk_category'] ?? json['riskCategory'] ?? 'Low Risk',
      centerLat: (json['center_lat'] ?? json['centerLat'] ?? 0.0).toDouble(),
      centerLng: (json['center_lng'] ?? json['centerLng'] ?? 0.0).toDouble(),
      avgCctv: (json['avg_cctv'] ?? json['avgCctv'] ?? 0.0).toDouble(),
      avgPoliceStations: (json['avg_police_stations'] ?? json['avgPoliceStations'] ?? 0.0).toDouble(),
      totalIncidents: json['total_incidents'] != null ? (json['total_incidents'] as num).toInt() : null,
      avgSeverity: json['avg_severity'] != null ? (json['avg_severity'] as num).toDouble() : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'City': city,
      'Location': location,
      'Time_of_Day': timeOfDay,
      'avg_risk_score': avgRiskScore,
      'risk_category': riskCategory,
      'center_lat': centerLat,
      'center_lng': centerLng,
      'avg_cctv': avgCctv,
      'avg_police_stations': avgPoliceStations,
      'total_incidents': totalIncidents,
      'avg_severity': avgSeverity,
    };
  }
}

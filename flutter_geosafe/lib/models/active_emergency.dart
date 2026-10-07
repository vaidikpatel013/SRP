class ActiveEmergency {
  final String emergencyId;
  final String userId;
  final String? userName;
  final String? userPhone;
  final String? emergencyContact;
  final String status;
  final double currentLat;
  final double currentLng;
  final dynamic lastUpdated;

  ActiveEmergency({
    required this.emergencyId,
    required this.userId,
    this.userName,
    this.userPhone,
    this.emergencyContact,
    required this.status,
    required this.currentLat,
    required this.currentLng,
    this.lastUpdated,
  });

  factory ActiveEmergency.fromMap(Map<String, dynamic> map, String id) {
    return ActiveEmergency(
      emergencyId: id,
      userId: map['user_id'] ?? '',
      userName: map['user_name'],
      userPhone: map['user_phone'],
      emergencyContact: map['emergency_contact'],
      status: map['status'] ?? 'ACTIVE',
      currentLat: (map['current_lat'] ?? 0.0).toDouble(),
      currentLng: (map['current_lng'] ?? 0.0).toDouble(),
      lastUpdated: map['last_updated'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'emergency_id': emergencyId,
      'user_id': userId,
      'user_name': userName,
      'user_phone': userPhone,
      'emergency_contact': emergencyContact,
      'status': status,
      'current_lat': currentLat,
      'current_lng': currentLng,
      'last_updated': lastUpdated,
    };
  }
}

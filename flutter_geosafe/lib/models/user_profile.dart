class UserProfile {
  final String uid;
  final String name;
  final String phone;
  final String emergencyContact;
  final dynamic createdAt;

  UserProfile({
    required this.uid,
    required this.name,
    required this.phone,
    required this.emergencyContact,
    this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'name': name,
      'phone': phone,
      'emergency_contact': emergencyContact,
      'created_at': createdAt,
    };
  }

  factory UserProfile.fromMap(Map<String, dynamic> map, String id) {
    return UserProfile(
      uid: id,
      name: map['name'] ?? '',
      phone: map['phone'] ?? '',
      emergencyContact: map['emergency_contact'] ?? '',
      createdAt: map['created_at'],
    );
  }
}

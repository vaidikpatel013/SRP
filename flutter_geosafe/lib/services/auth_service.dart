import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_profile.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<UserProfile> signInAnonymous() async {
    try {
      final cred = await _auth.signInAnonymously();
      final user = cred.user!;
      final profile = await getUserProfile(user.uid);
      if (profile != null) return profile;

      final newProfile = UserProfile(
        uid: user.uid,
        name: 'Guest User',
        phone: '',
        emergencyContact: '+91 99999 00000',
        createdAt: FieldValue.serverTimestamp(),
      );
      await saveUserProfile(newProfile);
      return newProfile;
    } catch (e) {
      // Offline fallback
      return UserProfile(
        uid: 'demo_guest_user',
        name: 'Demo Student',
        phone: '+91 98765 43210',
        emergencyContact: '+91 91234 56789',
      );
    }
  }

  Future<UserProfile?> getUserProfile(String uid) async {
    try {
      final doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists && doc.data() != null) {
        return UserProfile.fromMap(doc.data()!, uid);
      }
    } catch (e) {}
    return null;
  }

  Future<void> saveUserProfile(UserProfile profile) async {
    try {
      await _firestore.collection('users').doc(profile.uid).set(profile.toMap(), SetOptions(merge: true));
    } catch (e) {}
  }

  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } catch (e) {}
  }
}

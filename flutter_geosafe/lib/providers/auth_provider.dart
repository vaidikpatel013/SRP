import 'package:flutter/foundation.dart';
import '../models/user_profile.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  UserProfile? _user;
  bool _isLoading = true;

  UserProfile? get user => _user;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _init();
  }

  void _init() {
    _authService.authStateChanges.listen((firebaseUser) async {
      if (firebaseUser != null) {
        _user = await _authService.getUserProfile(firebaseUser.uid);
        _user ??= UserProfile(
          uid: firebaseUser.uid,
          name: firebaseUser.displayName ?? 'Student User',
          phone: firebaseUser.phoneNumber ?? '',
          emergencyContact: '+91 91234 56789',
        );
      } else {
        _user = null;
      }
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<void> signInAnonymous() async {
    _isLoading = true;
    notifyListeners();
    _user = await _authService.signInAnonymous();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateProfile(String name, String phone, String emergencyContact) async {
    if (_user == null) return;
    final updated = UserProfile(
      uid: _user!.uid,
      name: name,
      phone: phone,
      emergencyContact: emergencyContact,
    );
    await _authService.saveUserProfile(updated);
    _user = updated;
    notifyListeners();
  }

  Future<void> signOut() async {
    await _authService.signOut();
    _user = null;
    notifyListeners();
  }
}

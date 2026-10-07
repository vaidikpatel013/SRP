import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import { UserProfile } from '../types';

class AuthService {
  private mockUser: UserProfile | null = {
    uid: 'demo_user_101',
    name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    emergency_contact: '+91 91234 56789',
    created_at: new Date().toISOString()
  };

  /**
   * Listen to Firebase auth changes or provide mock session
   */
  onAuthState(callback: (user: FirebaseUser | UserProfile | null) => void) {
    if (isFirebaseConfigured()) {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const profile = await this.getUserProfile(firebaseUser.uid);
          callback(profile || {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Anonymous User',
            phone: firebaseUser.phoneNumber || '',
            emergency_contact: '',
            created_at: Date.now()
          });
        } else {
          callback(null);
        }
      });
    } else {
      // In demo/mock mode, trigger with default demo user
      callback(this.mockUser);
      return () => {};
    }
  }

  /**
   * Anonymous Sign In
   */
  async signInAnonymous(): Promise<UserProfile> {
    if (isFirebaseConfigured()) {
      const cred = await signInAnonymously(auth);
      const user = cred.user;
      const profile = await this.getUserProfile(user.uid);
      if (profile) return profile;

      const newProfile: UserProfile = {
        uid: user.uid,
        name: 'Guest User',
        phone: '',
        emergency_contact: '+91 99999 00000',
        created_at: Date.now()
      };
      await this.saveUserProfile(newProfile);
      return newProfile;
    } else {
      this.mockUser = {
        uid: 'demo_guest_' + Math.random().toString(36).substring(2, 8),
        name: 'Guest User (Demo)',
        phone: '+91 98765 43210',
        emergency_contact: '+91 91234 56789',
        created_at: Date.now()
      };
      return this.mockUser;
    }
  }

  /**
   * Email/Password Sign Up or Sign In
   */
  async signInWithEmail(email: string, pass: string, name?: string, emergencyContact?: string): Promise<UserProfile> {
    if (isFirebaseConfigured()) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const profile = await this.getUserProfile(cred.user.uid);
        if (profile) return profile;
        return {
          uid: cred.user.uid,
          name: name || email.split('@')[0],
          phone: '',
          emergency_contact: emergencyContact || '',
          created_at: Date.now()
        };
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          // Attempt sign up
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          const newProfile: UserProfile = {
            uid: cred.user.uid,
            name: name || email.split('@')[0],
            phone: '',
            emergency_contact: emergencyContact || '',
            created_at: Date.now()
          };
          await this.saveUserProfile(newProfile);
          return newProfile;
        }
        throw err;
      }
    } else {
      this.mockUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 8),
        name: name || email.split('@')[0] || 'Ananya Sharma',
        phone: '+91 98765 43210',
        emergency_contact: emergencyContact || '+91 91234 56789',
        created_at: Date.now()
      };
      return this.mockUser;
    }
  }

  /**
   * Retrieve user profile from collection `users`
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (isFirebaseConfigured()) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          return userDoc.data() as UserProfile;
        }
      } catch (err) {
        console.warn('Error fetching user profile from Firestore:', err);
      }
    }
    return this.mockUser;
  }

  /**
   * Save / update user profile in Firestore collection `users`
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'users', profile.uid), {
          uid: profile.uid,
          name: profile.name,
          phone: profile.phone,
          emergency_contact: profile.emergency_contact,
          created_at: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Error saving user profile to Firestore:', err);
      }
    }
    this.mockUser = profile;
  }

  /**
   * Sign Out
   */
  async logOut(): Promise<void> {
    if (isFirebaseConfigured()) {
      await signOut(auth);
    }
    this.mockUser = null;
  }
}

export const authService = new AuthService();

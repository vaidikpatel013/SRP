import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase Project Configuration from Firebase Console
// Project Settings -> General -> Your apps -> Web / React Native app config
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyGeoSafeAcademicDemoApiKey123456",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "geosafe-academic-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "geosafe-academic-project",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "geosafe-academic-project.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "109876543210",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:109876543210:web:abcdef1234567890"
};

// Check if credentials are placeholders
export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    !firebaseConfig.apiKey.includes("AIzaSyGeoSafeAcademicDemo") &&
    !firebaseConfig.projectId.includes("geosafe-academic-project")
  );
};

// Initialize Firebase App singleton safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

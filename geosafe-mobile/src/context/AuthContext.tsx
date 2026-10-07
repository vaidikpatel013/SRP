import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/AuthService';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInAnonymous: () => Promise<void>;
  signInWithEmail: (email: string, pass: string, name?: string, emergencyContact?: string) => Promise<void>;
  updateProfile: (name: string, phone: string, emergencyContact: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthState((authProfile) => {
      if (authProfile && 'uid' in authProfile) {
        setUser(authProfile as UserProfile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const signInAnonymous = async () => {
    setIsLoading(true);
    try {
      const profile = await authService.signInAnonymous();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string, name?: string, emergencyContact?: string) => {
    setIsLoading(true);
    try {
      const profile = await authService.signInWithEmail(email, pass, name, emergencyContact);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (name: string, phone: string, emergencyContact: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      name,
      phone,
      emergency_contact: emergencyContact
    };
    await authService.saveUserProfile(updated);
    setUser(updated);
  };

  const logOut = async () => {
    setIsLoading(true);
    try {
      await authService.logOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInAnonymous,
        signInWithEmail,
        updateProfile,
        logOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

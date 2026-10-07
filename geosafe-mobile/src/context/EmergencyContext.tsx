import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { ActiveEmergency, FakeCallSettings } from '../types';
import { emergencyService } from '../services/EmergencyService';
import { fakeCallService } from '../services/FakeCallService';
import { useAuth } from './AuthContext';
import { useSafety } from './SafetyContext';

interface EmergencyContextType {
  isSosArmed: boolean;
  countdownSeconds: number;
  isSosActive: boolean;
  activeEmergencyId: string | null;
  activeEmergencyData: ActiveEmergency | null;
  startSosCountdown: () => void;
  cancelSosCountdown: () => void;
  triggerSosImmediate: () => Promise<void>;
  resolveEmergency: () => Promise<void>;
  // Fake Call State (Discreet Escape Utility)
  isFakeCallIncoming: boolean;
  isFakeCallConnected: boolean;
  fakeCallTimerRemaining: number | null;
  fakeCallSettings: FakeCallSettings;
  scheduleFakeCall: (seconds: number) => void;
  cancelFakeCallTimer: () => void;
  acceptFakeCall: () => void;
  declineFakeCall: () => void;
  updateFakeCallSettings: (settings: Partial<FakeCallSettings>) => void;
}

const EmergencyContext = createContext<EmergencyContextType>({} as EmergencyContextType);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { userLocation } = useSafety();

  const [isSosArmed, setIsSosArmed] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [isSosActive, setIsSosActive] = useState<boolean>(false);
  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(null);
  const [activeEmergencyData, setActiveEmergencyData] = useState<ActiveEmergency | null>(null);

  // Fake Call States
  const [isFakeCallIncoming, setIsFakeCallIncoming] = useState<boolean>(false);
  const [isFakeCallConnected, setIsFakeCallConnected] = useState<boolean>(false);
  const [fakeCallTimerRemaining, setFakeCallTimerRemaining] = useState<number | null>(null);
  const [fakeCallSettings, setFakeCallSettings] = useState<FakeCallSettings>({
    callerName: 'Mom',
    callerNumber: '+91 98200 12345',
    delaySeconds: 5
  });

  const countdownTimerRef = useRef<any>(null);
  const fakeCallScheduleTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!activeEmergencyId) {
      setActiveEmergencyData(null);
      return;
    }

    return emergencyService.subscribeToEmergency(activeEmergencyId, data => {
      setActiveEmergencyData(data);
      if (data?.status === 'RESOLVED') {
        setIsSosActive(false);
      }
    });
  }, [activeEmergencyId]);

  useEffect(() => {
    if (!isSosActive || !activeEmergencyId) return;

    const interval = setInterval(() => {
      void emergencyService.updateEmergencyLocation(userLocation.latitude, userLocation.longitude);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeEmergencyId, isSosActive, userLocation.latitude, userLocation.longitude]);

  // Subscribe to fake call service triggers
  useEffect(() => {
    const unsub = fakeCallService.subscribe((active) => {
      setIsFakeCallIncoming(active);
      if (!active) {
        setIsFakeCallConnected(false);
      }
    });
    return unsub;
  }, []);

  const startSosCountdown = () => {
    if (isSosActive || isSosArmed) return;

    setIsSosArmed(true);
    setCountdownSeconds(5);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(error => {
      console.warn('SOS haptic feedback failed:', error);
    });

    let count = 5;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdownSeconds(count);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(error => {
        console.warn('SOS countdown haptic feedback failed:', error);
      });

      if (count <= 0) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setIsSosArmed(false);
        void triggerSosImmediate().catch(error => {
          console.error('Failed to activate emergency:', error);
        });
      }
    }, 1000);
  };

  const cancelSosCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsSosArmed(false);
    setCountdownSeconds(5);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(error => {
      console.warn('SOS cancellation haptic feedback failed:', error);
    });
  };

  const triggerSosImmediate = async () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsSosArmed(false);

    const emergencyId = await emergencyService.triggerSOS(
      user?.uid || 'anon_sos_user',
      userLocation.latitude,
      userLocation.longitude,
      {
        name: user?.name,
        phone: user?.phone,
        emergency_contact: user?.emergency_contact
      }
    );
    setActiveEmergencyId(emergencyId);
    setIsSosActive(true);
  };

  const resolveEmergency = async () => {
    if (activeEmergencyId) {
      await emergencyService.resolveEmergency(activeEmergencyId);
    }
    setIsSosActive(false);
    setActiveEmergencyId(null);
    setActiveEmergencyData(null);
  };

  // Fake Call Handlers
  const scheduleFakeCall = (seconds: number) => {
    if (fakeCallScheduleTimerRef.current) {
      clearInterval(fakeCallScheduleTimerRef.current);
    }

    if (seconds <= 0) {
      fakeCallService.triggerCall();
      return;
    }

    setFakeCallTimerRemaining(seconds);
    let remaining = seconds;

    fakeCallScheduleTimerRef.current = setInterval(() => {
      remaining -= 1;
      setFakeCallTimerRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(fakeCallScheduleTimerRef.current);
        fakeCallScheduleTimerRef.current = null;
        setFakeCallTimerRemaining(null);
        fakeCallService.triggerCall();
      }
    }, 1000);
  };

  const cancelFakeCallTimer = () => {
    if (fakeCallScheduleTimerRef.current) {
      clearInterval(fakeCallScheduleTimerRef.current);
      fakeCallScheduleTimerRef.current = null;
    }
    setFakeCallTimerRemaining(null);
    fakeCallService.cancelScheduledCall();
  };

  const acceptFakeCall = () => {
    fakeCallService.endCall();
    setIsFakeCallConnected(true);
  };

  const declineFakeCall = () => {
    fakeCallService.endCall();
    setIsFakeCallIncoming(false);
    setIsFakeCallConnected(false);
  };

  const updateFakeCallSettings = (settings: Partial<FakeCallSettings>) => {
    setFakeCallSettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <EmergencyContext.Provider
      value={{
        isSosArmed,
        countdownSeconds,
        isSosActive,
        activeEmergencyId,
        activeEmergencyData,
        startSosCountdown,
        cancelSosCountdown,
        triggerSosImmediate,
        resolveEmergency,
        isFakeCallIncoming,
        isFakeCallConnected,
        fakeCallTimerRemaining,
        fakeCallSettings,
        scheduleFakeCall,
        cancelFakeCallTimer,
        acceptFakeCall,
        declineFakeCall,
        updateFakeCallSettings
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);

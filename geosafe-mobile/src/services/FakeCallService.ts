import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

type FakeCallTriggerListener = (active: boolean) => void;

class FakeCallService {
  private timerId: any = null;
  private ringtoneInterval: any = null;
  private audioCtx: any = null;
  private isRinging = false;
  private listeners: Set<FakeCallTriggerListener> = new Set();

  /**
   * Schedule a fake call after a delay in seconds
   */
  scheduleFakeCall(delaySeconds: number) {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    if (delaySeconds <= 0) {
      this.triggerCall();
      return;
    }

    this.timerId = setTimeout(() => {
      this.triggerCall();
    }, delaySeconds * 1000);
  }

  /**
   * Cancel any scheduled timer
   */
  cancelScheduledCall() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Immediately trigger the fake incoming call
   */
  triggerCall() {
    this.isRinging = true;
    this.startRingtone();
    this.notifyListeners(true);
  }

  /**
   * End or decline the fake call
   */
  endCall() {
    this.isRinging = false;
    this.stopRingtone();
    this.notifyListeners(false);
  }

  /**
   * Start realistic synthesized phone ringtone and vibration
   */
  private startRingtone() {
    // Vibration pattern: 1s vibrate, 2s pause
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([1000, 2000], true);
      } catch (err) {
        console.warn('Vibration error:', err);
      }
    }

    // Synthesized audio generator using Web Audio API for Web, works with zero external asset dependencies!
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();

        const playRingBurst = () => {
          if (!this.isRinging || !this.audioCtx) return;
          try {
            const now = this.audioCtx.currentTime;
            
            // Frequency pair 1: 440Hz + 480Hz (Standard Telephony Ring)
            const osc1 = this.audioCtx.createOscillator();
            const osc2 = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(440, now);
            osc2.frequency.setValueAtTime(480, now);

            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 1.8);
            osc2.stop(now + 1.8);
          } catch (e) {
            console.warn('Audio synthesis error:', e);
          }
        };

        playRingBurst();
        this.ringtoneInterval = setInterval(playRingBurst, 3500);
      } catch (e) {
        console.warn('Could not initialize AudioContext:', e);
      }
    } else {
      // On mobile native, trigger haptic pulse cycles
      this.ringtoneInterval = setInterval(() => {
        if (this.isRinging) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        }
      }, 2000);
    }
  }

  /**
   * Stop ringtone and vibration
   */
  private stopRingtone() {
    if (Platform.OS !== 'web') {
      try {
        Vibration.cancel();
      } catch (err) {}
    }

    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }

  subscribe(listener: FakeCallTriggerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(active: boolean) {
    this.listeners.forEach(cb => cb(active));
  }
}

export const fakeCallService = new FakeCallService();

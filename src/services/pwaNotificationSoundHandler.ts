/**
 * PWA NOTIFICATION SOUND HANDLER
 * 🔊 IN-APP AUDIO FALLBACK - Plays custom MP3 sounds when app is OPEN
 * 
 * PURPOSE: Handle notification sounds from Service Worker messages
 * INTEGRATION: Listens to 'play-notification-sound' messages from sw.js
 * REQUIREMENTS: iOS + Android PWA sound guarantee
 * 
 * ARCHITECTURE:
 * - When app is CLOSED: Service Worker plays system notification sound
 * - When app is OPEN: This handler plays custom MP3 notification sound
 */

import { notificationSoundSettings } from './notificationSoundSettings';

export type NotificationSoundType = 'booking' | 'message' | 'status' | 'urgent';

const SOUND_FILES: Record<NotificationSoundType, string> = {
  booking: '/sounds/booking-notification.mp3',
  message: '/sounds/message-notification.mp3',
  status: '/sounds/success-notification.mp3',    // ✅ Fix: Use success sound (was missing status-notification.mp3)
  urgent: '/sounds/alert-notification.mp3'       // ✅ Fix: Use alert sound (was missing urgent-notification.mp3)
};

// Fallback: Use booking sound for all if specific files don't exist
const DEFAULT_SOUND = '/sounds/booking-notification.mp3';

class PWANotificationSoundHandler {
  private audioElement: HTMLAudioElement | null = null;
  private isInitialized = false;
  private soundQueue: NotificationSoundType[] = [];
  private isPlaying = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize service worker message listener
   */
  private initialize(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      console.log('✅ PWA Notification Sound Handler initialized');
      this.isInitialized = true;
    } else {
      console.warn('⚠️ Service Worker not supported - notification sounds disabled');
    }
  }

  /**
   * Handle messages from Service Worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;

    if (data.type === 'play-notification-sound') {
      // Service Worker is telling us to play a sound (app is open)
      const soundType = this.determineSoundType(data);
      this.playNotificationSound(soundType);
    }
  }

  /**
   * Determine sound type from message data
   */
  private determineSoundType(data: any): NotificationSoundType {
    if (data.priority === 'critical' || data.priority === 'urgent') {
      return 'urgent';
    }
    if (data.type === 'chat' || data.type === 'message') {
      return 'message';
    }
    if (data.type === 'status') {
      return 'status';
    }
    return 'booking'; // Default to booking sound
  }

  /**
   * Play notification sound with user settings applied
   */
  async playNotificationSound(type: NotificationSoundType = 'booking'): Promise<void> {
    // Check if sound is enabled in user settings
    if (!notificationSoundSettings.isSoundEnabled()) {
      console.log('🔇 Notification sound disabled by user settings');
      return;
    }

    try {
      // Get sound file path
      const soundUrl = SOUND_FILES[type] || DEFAULT_SOUND;

      // Create or reuse audio element
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }

      // Set source and volume
      this.audioElement.src = soundUrl;
      this.audioElement.volume = notificationSoundSettings.getVolume();

      // Play sound
      await this.audioElement.play();
      console.log(`🔊 Playing notification sound: ${type}`);

      // Trigger vibration if enabled
      if (notificationSoundSettings.isVibrationEnabled() && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      // Fallback: Try to play default sound
      if (type !== 'booking') {
        this.playFallbackSound();
      }
    }
  }

  /**
   * Fallback sound player (uses default booking sound)
   */
  private async playFallbackSound(): Promise<void> {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }
      this.audioElement.src = DEFAULT_SOUND;
      this.audioElement.volume = notificationSoundSettings.getVolume();
      await this.audioElement.play();
      console.log('🔊 Playing fallback notification sound');
    } catch (error) {
      console.error('Fallback sound also failed:', error);
    }
  }

  /**
   * Test notification sound
   */
  async testSound(type: NotificationSoundType = 'booking'): Promise<void> {
    console.log(`🧪 Testing ${type} notification sound...`);
    await this.playNotificationSound(type);
  }

  /**
   * Preload all notification sounds for instant playback
   */
  async preloadSounds(): Promise<void> {
    console.log('📥 Preloading notification sounds...');
    const preloadPromises = Object.values(SOUND_FILES).map(url => {
      return new Promise<void>((resolve) => {
        const audio = new Audio();
        audio.src = url;
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', () => resolve(), { once: true }); // Resolve even on error
        audio.load();
      });
    });

    try {
      await Promise.all(preloadPromises);
      console.log('✅ Notification sounds preloaded');
    } catch (error) {
      console.warn('⚠️ Some notification sounds failed to preload:', error);
    }
  }

  /**
   * 📱 iOS SPECIFIC: Request audio playback permission
   * iOS requires user gesture to enable audio playback
   * Call this from a button click or user interaction
   */
  async requestIOSAudioPermission(): Promise<boolean> {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }

      // iOS requires actual playback attempt from user gesture
      this.audioElement.src = DEFAULT_SOUND;
      this.audioElement.volume = 0.01; // Very quiet for permission test
      await this.audioElement.play();
      this.audioElement.pause();
      this.audioElement.currentTime = 0;

      console.log('✅ iOS audio playback permission granted');
      return true;
    } catch (error) {
      console.warn('⚠️ iOS audio permission denied or not needed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pwaNotificationSoundHandler = new PWANotificationSoundHandler();

// Auto-preload sounds on import (background operation)
if (typeof window !== 'undefined') {
  pwaNotificationSoundHandler.preloadSounds().catch(console.error);
}

export default pwaNotificationSoundHandler;

/**
 * Centralized Notification Sound System
 * 
 * Manages audio notifications for ALL dashboards:
 * - Therapist dashboard
 * - Massage place dashboard
 * - Facial place dashboard
 * - Admin dashboard
 * 
 * Notification types:
 * - message: New chat message
 * - booking: New booking request
 * - payment: Payment reminder
 * - alert: System alert
 * 
 * All MP3 files stored in /public/sounds/
 */

class NotificationSoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isInitialized: boolean = false;
  private enabled: boolean = true;
  private volume: number = 0.7;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadUserPreferences();
      this.initializeAudio();
      this.requestNotificationPermission();
    }
  }

  /**
   * Load user sound preferences from localStorage
   */
  private loadUserPreferences(): void {
    const savedEnabled = localStorage.getItem('notificationSoundsEnabled');
    const savedVolume = localStorage.getItem('notificationVolume');
    
    this.enabled = savedEnabled !== 'false';
    this.volume = savedVolume ? parseFloat(savedVolume) : 0.7;
  }

  /**
   * Request browser notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
        console.log('🔔 Notification permission:', Notification.permission);
      } catch (error) {
        console.warn('⚠️ Notification permission denied:', error);
      }
    }
  }

  /**
   * Initialize all audio files
   */
  private initializeAudio(): void {
    try {
      // Map sound types to MP3 files in /public/sounds/
      const soundFiles = {
        message: '/sounds/message-notification.mp3',
        booking: '/sounds/booking-notification.mp3',
        payment: '/sounds/payment-notification.mp3',
        alert: '/sounds/alert-notification.mp3'
      };

      // Create audio elements for each sound type
      Object.entries(soundFiles).forEach(([type, path]) => {
        const audio = new Audio(path);
        audio.volume = this.volume;
        audio.preload = 'auto';
        this.audioCache.set(type, audio);
      });

      this.isInitialized = true;
      console.log('🔊 Notification sound system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification sounds:', error);
    }
  }

  /**
   * Play notification sound
   * @param soundType Type of notification
   * @param withVibration Enable mobile vibration
   */
  async play(
    soundType: 'message' | 'booking' | 'payment' | 'alert' = 'message',
    withVibration: boolean = false
  ): Promise<void> {
    if (!this.enabled) {
      console.log('🔇 Notification sounds disabled');
      return;
    }

    if (!this.isInitialized) {
      console.warn('⚠️ Notification sound not initialized');
      return;
    }

    try {
      const audio = this.audioCache.get(soundType);
      
      if (!audio) {
        console.warn(`⚠️ Sound type "${soundType}" not found`);
        return;
      }

      // Reset and play
      audio.currentTime = 0;
      await audio.play();

      console.log(`🔊 Played ${soundType} notification`);

      // Vibrate if requested and supported
      if (withVibration && 'vibrate' in navigator) {
        const vibrationPatterns = {
          message: [50], // Subtle click
          booking: [300, 150, 300, 150, 300], // Strong triple pulse for main notification
          payment: [100, 50, 100], // Medium pulse
          alert: [400] // Single strong pulse
        };
        navigator.vibrate(vibrationPatterns[soundType]);
      }
    } catch (error) {
      console.error('❌ Failed to play notification sound:', error);
      // Fallback to system beep
      this.playSystemBeep();
    }
  }

  /**
   * Play system beep as fallback (Web Audio API)
   */
  private playSystemBeep(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('🔔 System beep played as fallback');
    } catch (error) {
      console.error('❌ Failed to play system beep:', error);
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(
    title: string,
    body: string,
    options?: NotificationOptions
  ): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('🔔 Browser notification shown');
    }
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('notificationSoundsEnabled', enabled.toString());
    console.log(`🔊 Notification sounds ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update all cached audio elements
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
    
    localStorage.setItem('notificationVolume', this.volume.toString());
    console.log(`🔊 Volume set to ${Math.round(this.volume * 100)}%`);
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Preload all sounds for instant playback
   */
  async preloadSounds(): Promise<void> {
    const soundTypes: Array<'message' | 'booking' | 'payment' | 'alert'> = 
      ['message', 'booking', 'payment', 'alert'];
    
    for (const type of soundTypes) {
      const audio = this.audioCache.get(type);
      if (audio) {
        // Loading the audio metadata
        audio.load();
      }
    }
    
    console.log('🔊 All notification sounds preloaded');
  }
}

// Export singleton instance
export const notificationSound = new NotificationSoundManager();

// Convenience functions for specific notification types
export const playMessageSound = (withVibration = false) => 
  notificationSound.play('message', withVibration);

export const playBookingSound = (withVibration = true) => 
  notificationSound.play('booking', withVibration);

export const playPaymentSound = (withVibration = false) => 
  notificationSound.play('payment', withVibration);

export const playAlertSound = (withVibration = true) => 
  notificationSound.play('alert', withVibration);

// Preload sounds after first user interaction (browser requirement)
if (typeof window !== 'undefined') {
  const preloadOnInteraction = () => {
    notificationSound.preloadSounds();
  };
  
  document.addEventListener('click', preloadOnInteraction, { once: true });
  document.addEventListener('touchstart', preloadOnInteraction, { once: true });
}

export default notificationSound;

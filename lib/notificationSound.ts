// Notification Sound System for Booking Alerts
// Plays MP3 alert when therapist/massage place receives booking request

class NotificationSoundManager {
  private audio: HTMLAudioElement | null = null;
  private isInitialized: boolean = false;
  private loopInterval: NodeJS.Timeout | null = null;
  private isPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudio();
      this.requestNotificationPermission();
    }
  }

  private async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
        console.log('🔔 Notification permission:', Notification.permission);
      } catch (error) {
        console.warn('⚠️ Notification permission denied:', error);
      }
    }
  }

  private initializeAudio() {
    try {
      // Create audio element for notification sound
      // Using existing booking notification sound from sounds folder
      this.audio = new Audio('/sounds/booking-notification.mp3');
      this.audio.volume = 0.8; // 80% volume
      this.audio.preload = 'auto';
      this.isInitialized = true;
      
      console.log('🔊 Notification sound system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification sound:', error);
    }
  }

  /**
   * Play notification sound for new booking with continuous loop until acknowledged
   * This will play repeatedly every 3 seconds until stopPersistentAlert() is called
   */
  async playBookingAlert(): Promise<void> {
    if (!this.audio || !this.isInitialized) {
      console.warn('⚠️ Notification sound not initialized');
      return;
    }

    try {
      // Show browser notification if permission granted
      this.showBrowserNotification();

      // Start persistent loop
      this.startPersistentLoop();
      
      console.log('🔔 Persistent booking notification started');
    } catch (error) {
      console.error('❌ Failed to play notification sound:', error);
      this.playSystemBeep();
    }
  }

  /**
   * Start persistent notification loop - plays every 3 seconds
   */
  private startPersistentLoop(): void {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
    }

    this.isPlaying = true;

    // Play immediately
    this.playSound();

    // Then play every 3 seconds
    this.loopInterval = setInterval(() => {
      if (this.isPlaying) {
        this.playSound();
      }
    }, 3000);
  }

  /**
   * Stop persistent notification loop
   */
  stopPersistentAlert(): void {
    this.isPlaying = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    console.log('🔕 Persistent notification stopped');
  }

  /**
   * Play sound once
   */
  private async playSound(): Promise<void> {
    if (!this.audio) return;

    try {
      this.audio.currentTime = 0;
      await this.audio.play();
    } catch (error) {
      console.warn('⚠️ Audio play failed:', error);
    }
  }

  /**
   * Show browser notification (works when app is in background)
   */
  private showBrowserNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🚨 NEW BOOKING REQUEST!', {
        body: 'You have a new massage booking. Click to respond!',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'booking-alert',
        requireInteraction: true, // Notification stays until user interacts
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Trigger vibration separately if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      console.log('🔔 Browser notification shown');
    }
  }

  /**
   * Play multiple beeps for urgent notifications
   */
  async playUrgentAlert(): Promise<void> {
    if (!this.audio || !this.isInitialized) {
      console.warn('⚠️ Notification sound not initialized');
      return;
    }

    try {
      // Play sound 3 times for urgent alerts
      for (let i = 0; i < 3; i++) {
        this.audio.currentTime = 0;
        await this.audio.play();
        
        // Wait 500ms between beeps
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('🚨 Urgent booking alert played');
    } catch (error) {
      console.error('❌ Failed to play urgent alert:', error);
      this.playSystemBeep();
    }
  }

  /**
   * Fallback system beep using Web Audio API
   */
  private playSystemBeep(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frequency in Hz
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
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Test the notification sound
   */
  async testSound(): Promise<void> {
    console.log('🧪 Testing notification sound...');
    await this.playBookingAlert();
  }
}

// Create singleton instance
export const notificationSound = new NotificationSoundManager();

// Global function to play booking notification
(window as any).playBookingNotification = () => {
  notificationSound.playBookingAlert();
};

// Global function for urgent notifications
(window as any).playUrgentNotification = () => {
  notificationSound.playUrgentAlert();
};

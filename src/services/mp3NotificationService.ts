/**
 * MP3 Notification Service
 * Handles audio notifications for booking reminders and system events
 */

export interface NotificationSound {
  id: string;
  name: string;
  filename: string;
  description: string;
  category: 'reminder' | 'booking' | 'payment' | 'system';
}

export interface ScheduledNotification {
  id: string;
  type: 'booking_reminder' | 'payment_reminder' | 'appointment_alert';
  scheduledFor: Date;
  soundId: string;
  message: string;
  bookingId?: string;
  repeat?: {
    enabled: boolean;
    intervalMinutes: number;
    maxRepeats: number;
  };
  metadata?: {
    customerName?: string;
    providerName?: string;
    serviceType?: string;
    appointmentTime?: string;
  };
}

class MP3NotificationService {
  private audioContext: AudioContext | null = null;
  private soundCache = new Map<string, AudioBuffer>();
  private scheduledNotifications = new Map<string, NodeJS.Timeout>();
  private isInitialized = false;

  // Predefined notification sounds - mapped to actual files in /public/sounds/
  private readonly availableSounds: NotificationSound[] = [
    {
      id: 'gentle_chime',
      name: 'Gentle Chime',
      filename: 'alert-notification.mp3', // ✅ Mapped to existing file
      description: 'Soft, pleasant chime for appointment reminders',
      category: 'reminder'
    },
    {
      id: 'booking_confirmed',
      name: 'Booking Confirmed',
      filename: 'booking-notification.mp3', // ✅ Mapped to existing file
      description: 'Success sound for booking confirmations',
      category: 'booking'
    },
    {
      id: 'payment_success',
      name: 'Payment Success',
      filename: 'payment-notification.mp3', // ✅ Mapped to existing file
      description: 'Confirmation sound for successful payments',
      category: 'payment'
    },
    {
      id: 'appointment_alert',
      name: 'Appointment Alert',
      filename: 'alert-notification.mp3', // ✅ Mapped to existing file
      description: 'Urgent alert for upcoming appointments',
      category: 'reminder'
    },
    {
      id: 'spa_bell',
      name: 'Spa Bell',
      filename: 'success-notification.mp3', // ✅ Mapped to existing file
      description: 'Relaxing spa-like bell sound',
      category: 'reminder'
    }
  ];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.isInitialized = true;
      } else {
        console.warn('AudioContext not supported - using fallback HTML5 audio');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Preload sound files into cache for better performance
   */
  async preloadSounds(soundIds?: string[]): Promise<void> {
    const soundsToLoad = soundIds ? 
      this.availableSounds.filter(s => soundIds.includes(s.id)) : 
      this.availableSounds;

    const loadPromises = soundsToLoad.map(sound => this.loadSoundBuffer(sound.filename));
    
    try {
      await Promise.all(loadPromises);
      console.log(`Preloaded ${soundsToLoad.length} notification sounds`);
    } catch (error) {
      console.error('Failed to preload some notification sounds:', error);
    }
  }

  private async loadSoundBuffer(filename: string): Promise<AudioBuffer | null> {
    if (this.soundCache.has(filename)) {
      return this.soundCache.get(filename)!;
    }

    try {
      const response = await fetch(`/sounds/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${filename}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      if (this.audioContext) {
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.soundCache.set(filename, audioBuffer);
        return audioBuffer;
      }
      
      return null;
    } catch (error) {
      // Silently handle audio decoding errors - notification sounds are optional
      // Only log in debug mode to avoid console noise
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev && (window as any).DEBUG_AUDIO) {
        console.warn(`Could not load sound ${filename}:`, error);
      }
      return null;
    }
  }

  /**
   * Play notification sound immediately
   */
  async playNotification(soundId: string, volume: number = 0.7): Promise<void> {
    const sound = this.availableSounds.find(s => s.id === soundId);
    if (!sound) {
      console.error(`Sound not found: ${soundId}`);
      return;
    }

    try {
      if (this.audioContext) {
        await this.playWithAudioContext(sound.filename, volume);
      } else {
        await this.playWithHtmlAudio(sound.filename, volume);
      }
    } catch (error) {
      console.error(`Failed to play notification ${soundId}:`, error);
      // Fallback to HTML5 audio
      await this.playWithHtmlAudio(sound.filename, volume);
    }
  }

  private async playWithAudioContext(filename: string, volume: number): Promise<void> {
    if (!this.audioContext) return;

    const audioBuffer = await this.loadSoundBuffer(filename);
    if (!audioBuffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  private async playWithHtmlAudio(filename: string, volume: number): Promise<void> {
    const audio = new Audio(`/sounds/${filename}`);
    audio.volume = volume;
    
    return new Promise((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  }

  /**
   * Schedule a notification to play at a specific time
   */
  scheduleNotification(notification: ScheduledNotification): string {
    const now = new Date();
    const delay = notification.scheduledFor.getTime() - now.getTime();

    if (delay <= 0) {
      // Schedule immediately if time has passed
      this.playNotification(notification.soundId);
      return notification.id;
    }

    const timeoutId = setTimeout(async () => {
      await this.playNotification(notification.soundId);
      
      // Handle repeating notifications
      if (notification.repeat?.enabled) {
        this.scheduleRepeatingNotification(notification);
      }
      
      // Remove from scheduled notifications
      this.scheduledNotifications.delete(notification.id);
      
      // Log the notification
      console.log('Notification played:', {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        metadata: notification.metadata
      });
      
    }, delay);

    this.scheduledNotifications.set(notification.id, timeoutId);
    return notification.id;
  }

  private scheduleRepeatingNotification(notification: ScheduledNotification): void {
    if (!notification.repeat) return;

    let repeatCount = 0;
    const maxRepeats = notification.repeat.maxRepeats;
    const intervalMs = notification.repeat.intervalMinutes * 60 * 1000;

    const repeatInterval = setInterval(async () => {
      repeatCount++;
      
      await this.playNotification(notification.soundId);
      
      if (repeatCount >= maxRepeats) {
        clearInterval(repeatInterval);
        console.log(`Notification repeat completed for ${notification.id}`);
      }
    }, intervalMs);
  }

  /**
   * Schedule booking reminder notifications (3 hours before, then closer intervals)
   */
  scheduleBookingReminders(
    bookingId: string, 
    appointmentDate: Date, 
    customerName: string,
    providerName: string,
    serviceType: string
  ): string[] {
    const reminderSchedules = [
      { hours: 3, soundId: 'gentle_chime', message: '3 hours until appointment' },
      { hours: 1, soundId: 'spa_bell', message: '1 hour until appointment' },
      { minutes: 30, soundId: 'appointment_alert', message: '30 minutes until appointment' },
      { minutes: 15, soundId: 'appointment_alert', message: '15 minutes until appointment' }
    ];

    const notificationIds: string[] = [];

    reminderSchedules.forEach((schedule, index) => {
      const reminderTime = new Date(appointmentDate);
      
      if ('hours' in schedule) {
        reminderTime.setHours(reminderTime.getHours() - schedule.hours);
      } else {
        reminderTime.setMinutes(reminderTime.getMinutes() - schedule.minutes!);
      }

      const notification: ScheduledNotification = {
        id: `${bookingId}_reminder_${index}`,
        type: 'booking_reminder',
        scheduledFor: reminderTime,
        soundId: schedule.soundId,
        message: schedule.message,
        bookingId: bookingId,
        metadata: {
          customerName,
          providerName,
          serviceType,
          appointmentTime: appointmentDate.toLocaleString()
        }
      };

      const notificationId = this.scheduleNotification(notification);
      notificationIds.push(notificationId);
    });

    return notificationIds;
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(notificationId: string): boolean {
    const timeoutId = this.scheduledNotifications.get(notificationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(notificationId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all notifications for a specific booking
   */
  cancelBookingNotifications(bookingId: string): number {
    let cancelledCount = 0;
    
    for (const [notificationId] of this.scheduledNotifications) {
      if (notificationId.startsWith(`${bookingId}_`)) {
        if (this.cancelNotification(notificationId)) {
          cancelledCount++;
        }
      }
    }
    
    return cancelledCount;
  }

  /**
   * Get list of available notification sounds
   */
  getAvailableSounds(): NotificationSound[] {
    return [...this.availableSounds];
  }

  /**
   * Get current scheduled notifications count
   */
  getScheduledNotificationsCount(): number {
    return this.scheduledNotifications.size;
  }

  /**
   * Test notification playback
   */
  async testNotification(soundId: string = 'gentle_chime'): Promise<void> {
    console.log(`Testing notification sound: ${soundId}`);
    await this.playNotification(soundId, 0.5);
  }

  /**
   * Check browser notification permission and request if needed
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show browser notification with sound
   */
  async showNotificationWithSound(
    title: string, 
    message: string, 
    soundId: string = 'gentle_chime',
    options?: NotificationOptions
  ): Promise<void> {
    // Play sound first
    await this.playNotification(soundId);

    // Show browser notification if permitted
    if (await this.requestNotificationPermission()) {
      new Notification(title, {
        body: message,
        icon: '/icon-192.png',
        tag: 'massage-booking',
        ...options
      });
    }
  }
}

// Export singleton instance
export const mp3NotificationService = new MP3NotificationService();

// Preload common sounds on module import
mp3NotificationService.preloadSounds(['gentle_chime', 'booking_confirmed', 'appointment_alert']).catch(console.error);

export default mp3NotificationService;
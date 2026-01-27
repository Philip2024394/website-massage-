import { logger } from './enterpriseLogger';
/**
 * 🔔 THERAPIST NOTIFICATION SERVICE
 * 
 * Features:
 * ✅ Real-time booking notifications with full details
 * ✅ MP3 audio alerts with vibration
 * ✅ Accept/Reject buttons
 * ✅ Auto-open chat window
 * ✅ User location tracking from landing page
 * ✅ Push notifications
 */

import { notificationSoundService } from '../lib/notificationSoundService';
import { locationService } from './locationService';

interface BookingNotification {
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  duration: number;
  price: number;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    zone?: string;
  };
  requestedTime: string;
  createdAt: string;
  deadline: string; // 5 minutes from creation
}

interface NotificationPreferences {
  sound: boolean;
  vibration: boolean;
  autoOpenChat: boolean;
  volume: number;
}

class TherapistNotificationService {
  private static instance: TherapistNotificationService;
  private audioService: any;
  private preferences: NotificationPreferences = {
    sound: true,
    vibration: true,
    autoOpenChat: true,
    volume: 0.8
  };
  
  private activeNotifications: Map<string, BookingNotification> = new Map();
  private notificationHandlers: Array<(booking: BookingNotification) => void> = [];

  constructor() {
    this.initializeAudio();
    this.setupLocationTracking();
    this.requestPermissions();
  }

  public static getInstance(): TherapistNotificationService {
    if (!TherapistNotificationService.instance) {
      TherapistNotificationService.instance = new TherapistNotificationService();
    }
    return TherapistNotificationService.instance;
  }

  private async initializeAudio() {
    try {
      // Use the existing instance instead of creating a new one
      this.audioService = notificationSoundService;
      logger.info('🔊 Therapist audio service initialized');
    } catch (error) {
      logger.error('Failed to initialize audio service:', error);
    }
  }

  private setupLocationTracking() {
    // Track user entry from landing page
    if (typeof window !== 'undefined') {
      const trackUserEntry = () => {
        const referrer = document.referrer;
        const entryTime = new Date().toISOString();
        const userAgent = navigator.userAgent;
        
        // Get location if available
        locationService.getCurrentLocation()
          .then(location => {
            logger.info('📍 User location tracked:', {
              entryTime,
              referrer,
              userAgent,
              location: location ? {
                lat: location.lat || location.latitude,
                lng: location.lng || location.longitude,
                accuracy: (location as any).accuracy || 'N/A'
              } : 'Permission denied'
            });
            
            // Store in session for booking context
            sessionStorage.setItem('userEntryData', JSON.stringify({
              entryTime,
              referrer,
              userAgent,
              location
            }));
          })
          .catch(error => {
            logger.info('📍 Location tracking blocked:', error.message);
          });
      };

      // Track on page load
      if (document.readyState === 'complete') {
        trackUserEntry();
      } else {
        window.addEventListener('load', trackUserEntry);
      }
    }
  }

  private async requestPermissions() {
    try {
      // Request notification permission
      if ('Notification' in window) {
        await Notification.requestPermission();
      }

      // Request vibration permission (implicit)
      if ('vibrate' in navigator) {
        logger.info('📳 Vibration supported');
      }
    } catch (error) {
      logger.warn('Permission request failed:', error);
    }
  }

  /**
   * Send booking notification to therapist
   */
  public async notifyBookingRequest(booking: BookingNotification): Promise<void> {
    logger.info('🔔 Sending booking notification to therapist:', booking.bookingId);
    
    // Store notification
    this.activeNotifications.set(booking.bookingId, booking);

    // Play sound notification
    if (this.preferences.sound && this.audioService) {
      try {
        await this.audioService.playSound('booking', { 
          volume: this.preferences.volume,
          loop: true, // Loop until accepted/rejected
          stopOnAction: true
        });
      } catch (error) {
        logger.warn('Failed to play notification sound:', error);
      }
    }

    // Trigger vibration
    if (this.preferences.vibration && 'vibrate' in navigator) {
      // Urgent vibration pattern: long-short-long-short
      navigator.vibrate([800, 200, 800, 200, 800]);
    }

    // Show browser notification
    this.showBrowserNotification(booking);

    // Auto-open chat window
    if (this.preferences.autoOpenChat) {
      this.openChatWindow(booking);
    }

    // Notify all handlers
    this.notificationHandlers.forEach(handler => handler(booking));

    // Set timeout for auto-expiry
    setTimeout(() => {
      this.expireNotification(booking.bookingId);
    }, 5 * 60 * 1000); // 5 minutes
  }

  private showBrowserNotification(booking: BookingNotification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`New Booking Request`, {
        body: `${booking.customerName} wants a ${booking.duration}min ${booking.serviceType} massage at ${booking.location.address}`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `booking-${booking.bookingId}`,
        requireInteraction: true,
        actions: [
          { action: 'accept', title: 'Accept' },
          { action: 'reject', title: 'Reject' }
        ]
      });

      notification.onclick = () => {
        this.openChatWindow(booking);
        notification.close();
      };
    }
  }

  private openChatWindow(booking: BookingNotification) {
    // Trigger chat window opening
    const event = new CustomEvent('openTherapistChat', {
      detail: {
        bookingId: booking.bookingId,
        customerId: booking.customerId,
        customerName: booking.customerName,
        booking
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Accept booking request
   */
  public async acceptBooking(bookingId: string): Promise<void> {
    const booking = this.activeNotifications.get(bookingId);
    if (!booking) return;

    logger.info('✅ Therapist accepted booking:', bookingId);
    
    // Stop notification sounds
    if (this.audioService) {
      this.audioService.stopSound('booking');
    }

    // Play success sound
    if (this.audioService) {
      await this.audioService.playSound('success', { volume: 0.6 });
    }

    // Success vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Remove from active notifications
    this.activeNotifications.delete(bookingId);

    // Send acceptance to backend
    await this.sendBookingResponse(bookingId, 'accepted');
  }

  /**
   * Reject booking request
   */
  public async rejectBooking(bookingId: string, reason?: string): Promise<void> {
    const booking = this.activeNotifications.get(bookingId);
    if (!booking) return;

    logger.info('❌ Therapist rejected booking:', bookingId, reason);
    
    // Stop notification sounds
    if (this.audioService) {
      this.audioService.stopSound('booking');
    }

    // Remove from active notifications
    this.activeNotifications.delete(bookingId);

    // Send rejection to backend
    await this.sendBookingResponse(bookingId, 'rejected', reason);
  }

  private async sendBookingResponse(bookingId: string, status: 'accepted' | 'rejected', reason?: string) {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/booking/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status,
          reason,
          respondedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      logger.info(`📤 Booking ${status} sent to server:`, bookingId);
    } catch (error) {
      logger.error('Failed to send booking response:', error);
      throw error;
    }
  }

  private expireNotification(bookingId: string) {
    const booking = this.activeNotifications.get(bookingId);
    if (booking) {
      logger.info('⏰ Booking notification expired:', bookingId);
      
      // Stop sounds
      if (this.audioService) {
        this.audioService.stopSound('booking');
      }

      // Remove notification
      this.activeNotifications.delete(bookingId);
    }
  }

  /**
   * Subscribe to booking notifications
   */
  public onBookingNotification(handler: (booking: BookingNotification) => void): () => void {
    this.notificationHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get all active notifications
   */
  public getActiveNotifications(): BookingNotification[] {
    return Array.from(this.activeNotifications.values());
  }

  /**
   * Update notification preferences
   */
  public updatePreferences(prefs: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...prefs };
    logger.info('🔧 Notification preferences updated:', this.preferences);
  }

  /**
   * Get user entry tracking data
   */
  public getUserEntryData(): any {
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('userEntryData');
      return data ? JSON.parse(data) : null;
    }
    return null;
  }
}

// Export singleton instance
export const therapistNotificationService = TherapistNotificationService.getInstance();

// Export types
export type { BookingNotification, NotificationPreferences };
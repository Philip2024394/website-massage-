// Push Notifications using Service Worker + Push API
// This enables notifications even when phone is locked or app is closed

import { logger } from '@/lib/logger.production';

class PushNotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): void {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    if (!this.isSupported) {
      logger.warn('⚠️ Push notifications not supported on this device');
    }
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (!this.isSupported) return;

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      logger.debug('✅ Service Worker registered:', this.swRegistration);

      // Request notification permission
      await this.requestPermission();
    } catch (error) {
      logger.error('❌ Failed to initialize push notifications:', error);
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        logger.debug('✅ Notification permission granted');
        await this.subscribeToPushNotifications();
        return true;
      } else {
        logger.warn('⚠️ Notification permission denied');
        return false;
      }
    } catch (error) {
      logger.error('❌ Failed to request permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications(): Promise<void> {
    if (!this.swRegistration) return;

    try {
      // Get push subscription
      let subscription = await this.swRegistration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription (VAPID key optional for testing)
        const vapidKey = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY;
        
        const options: PushSubscriptionOptionsInit = {
          userVisibleOnly: true
        };
        
        if (vapidKey) {
          options.applicationServerKey = this.urlBase64ToUint8Array(vapidKey);
          logger.debug('✅ VAPID key configured for push notifications');
        } else {
          // Only log in development - VAPID is optional for testing
          if (import.meta.env.DEV) {
            logger.info('ℹ️ Push notifications will work without VAPID key (testing mode)');
          }
        }
        
        subscription = await this.swRegistration.pushManager.subscribe(options);
      }

      // Save subscription to Appwrite (for sending notifications later)
      await this.saveSubscriptionToServer(subscription);
      
      logger.debug('✅ Push subscription created:', subscription);
    } catch (error) {
      logger.error('❌ Failed to subscribe to push notifications:', error);
    }
  }

  /**
   * Save push subscription to Appwrite database
   */
  private async saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      // Store in localStorage for now (you can save to Appwrite user preferences)
      localStorage.setItem('push_subscription', JSON.stringify(subscriptionData));
      
      logger.debug('✅ Push subscription saved');
    } catch (error) {
      logger.error('❌ Failed to save subscription:', error);
    }
  }

  /**
   * Send push notification to therapist/massage place
   */
  async sendBookingNotification(
    userId: string,
    bookingData: {
      customerName: string;
      duration: number;
      price: number;
      location: string;
    }
  ): Promise<void> {
    try {
      // Show local notification immediately (for when app is open)
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('🚨 NEW BOOKING REQUEST!', {
          body: `${bookingData.customerName} - ${bookingData.duration} min - IDR ${bookingData.price.toLocaleString()}`,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'booking-alert',
          requireInteraction: true,
          silent: false,
          data: bookingData
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Vibrate phone
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
        }
      }

      logger.debug('✅ Booking notification sent');
    } catch (error) {
      logger.error('❌ Failed to send notification:', error);
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray as Uint8Array<ArrayBuffer>;
  }
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Create singleton instance
export const pushNotifications = new PushNotificationManager();

// Global function to send booking notification
(window as any).sendBookingNotification = (userId: string, bookingData: any) => {
  return pushNotifications.sendBookingNotification(userId, bookingData);
};

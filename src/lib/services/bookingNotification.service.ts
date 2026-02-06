/**
 * 🔔 BOOKING NOTIFICATION SERVICE - Production Ready
 * 
 * Purpose: Handles push notifications for booking status changes and chat messages
 * Features:
 * - Browser push notifications for booking acceptance/rejection
 * - Timer-based notifications (5 min, 2 min, 1 min warnings)
 * - Chat message notifications
 * - Cross-browser compatibility
 * - Notification permission handling
 */

import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';
import { ID } from 'appwrite';

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

export interface BookingNotificationData {
  bookingId: string;
  chatRoomId: string;
  type: 'booking_accepted' | 'booking_rejected' | 'booking_expired' | 'time_warning' | 'chat_message';
  timeRemaining?: number;
  therapistName?: string;
  customerName?: string;
  serviceType?: string;
}

class BookingNotificationService {
  private notificationPermission: NotificationPermission = 'default';
  private registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

  constructor() {
    this.checkNotificationSupport();
  }

  /**
   * Check if notifications are supported and get current permission
   */
  private checkNotificationSupport(): boolean {
    if (!('Notification' in window)) {
      console.warn('⚠️ This browser does not support desktop notifications');
      return false;
    }

    this.notificationPermission = Notification.permission;
    console.log(`🔔 Notification permission: ${this.notificationPermission}`);
    return true;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (this.notificationPermission === 'default') {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        // Store permission in localStorage for future reference
        localStorage.setItem('notification-permission-granted', 'true');
      } else {
        console.log('❌ Notification permission denied');
        localStorage.setItem('notification-permission-granted', 'false');
      }
    }

    return this.notificationPermission;
  }

  /**
   * Get service worker registration for advanced notifications
   */
  private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registrationPromise) {
      return this.registrationPromise;
    }

    if (!('serviceWorker' in navigator)) {
      return null;
    }

    this.registrationPromise = navigator.serviceWorker.ready.catch(() => null);
    return this.registrationPromise;
  }

  /**
   * Show a browser notification
   */
  async showNotification(config: NotificationConfig): Promise<boolean> {
    try {
      // Ensure we have permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Cannot show notification - permission not granted');
        return false;
      }

      // Try to use service worker notification (more advanced)
      const registration = await this.getServiceWorkerRegistration();
      if (registration) {
        await registration.showNotification(config.title, {
          body: config.body,
          icon: config.icon || '/icon-192.png',
          badge: config.badge || '/icon-72.png',
          tag: config.tag || 'booking-notification',
          requireInteraction: config.requireInteraction || false,
          actions: config.actions || [],
          data: config.data
        });
        console.log('✅ Service worker notification shown');
      } else {
        // Fallback to basic notification
        const notification = new Notification(config.title, {
          body: config.body,
          icon: config.icon || '/icon-192.png',
          tag: config.tag || 'booking-notification',
          data: config.data
        });

        // Auto-close after 5 seconds for non-critical notifications
        if (!config.requireInteraction) {
          setTimeout(() => notification.close(), 5000);
        }

        console.log('✅ Basic notification shown');
      }

      return true;

    } catch (error) {
      console.error('❌ Error showing notification:', error);
      return false;
    }
  }

  /**
   * Show booking status notification
   */
  async notifyBookingStatus(
    type: 'accepted' | 'rejected' | 'expired',
    therapistName: string,
    serviceType: string,
    bookingId: string,
    chatRoomId: string
  ): Promise<void> {
    let title: string;
    let body: string;
    let requireInteraction = false;

    switch (type) {
      case 'accepted':
        title = '✅ Booking Accepted!';
        body = `${therapistName} has accepted your ${serviceType} booking. You can now chat with them.`;
        requireInteraction = true;
        break;
      case 'rejected':
        title = '❌ Booking Declined';
        body = `${therapistName} cannot accept your ${serviceType} booking. We're finding other available therapists.`;
        requireInteraction = true;
        break;
      case 'expired':
        title = '⏰ Booking Expired';
        body = `Your booking request has expired. We're automatically searching for other available therapists.`;
        requireInteraction = true;
        break;
    }

    await this.showNotification({
      title,
      body,
      tag: `booking-${type}-${bookingId}`,
      requireInteraction,
      actions: [
        { action: 'open-chat', title: 'Open Chat' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: {
        type: `booking_${type}`,
        bookingId,
        chatRoomId,
        therapistName,
        serviceType
      }
    });

    // Log notification to database for tracking
    this.logNotification(bookingId, type, { therapistName, serviceType });
  }

  /**
   * Show time warning notifications
   */
  async notifyTimeWarning(
    timeRemaining: number, // in seconds
    therapistName: string,
    serviceType: string,
    bookingId: string
  ): Promise<void> {
    const minutes = Math.floor(timeRemaining / 60);
    let message: string;
    let urgency: 'low' | 'medium' | 'high' = 'low';

    if (minutes <= 1) {
      message = `⚠️ Final minute! ${therapistName} has less than 1 minute to respond to your ${serviceType} booking.`;
      urgency = 'high';
    } else if (minutes <= 2) {
      message = `⏰ ${therapistName} has ${minutes} minutes to respond to your ${serviceType} booking.`;
      urgency = 'medium';
    } else if (minutes <= 5) {
      message = `⏱️ ${therapistName} has ${minutes} minutes to respond to your ${serviceType} booking.`;
      urgency = 'medium';
    } else {
      return; // Don't notify for longer times
    }

    await this.showNotification({
      title: 'Booking Response Pending',
      body: message,
      tag: `booking-warning-${bookingId}`,
      requireInteraction: urgency === 'high',
      data: {
        type: 'time_warning',
        bookingId,
        timeRemaining,
        urgency
      }
    });
  }

  /**
   * Show chat message notification
   */
  async notifyChatMessage(
    senderName: string,
    message: string,
    chatRoomId: string,
    isBookingChat: boolean = false
  ): Promise<void> {
    const title = isBookingChat ? `💬 ${senderName} (Booking Chat)` : `💬 ${senderName}`;
    const body = message.length > 100 ? message.substring(0, 97) + '...' : message;

    await this.showNotification({
      title,
      body,
      tag: `chat-${chatRoomId}`,
      requireInteraction: false,
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'open-chat', title: 'Open Chat' }
      ],
      data: {
        type: 'chat_message',
        chatRoomId,
        senderName,
        originalMessage: message,
        isBookingChat
      }
    });
  }

  /**
   * Log notification to database for analytics
   */
  private async logNotification(
    bookingId: string,
    type: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      if (!COLLECTIONS.NOTIFICATIONS) {
        return; // Skip logging if notifications collection not configured
      }

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          bookingId,
          type: `booking_notification_${type}`,
          metadata: JSON.stringify(metadata),
          timestamp: new Date().toISOString(),
          platform: 'web_app',
          userAgent: navigator.userAgent
        }
      );

    } catch (error) {
      console.warn('⚠️ Could not log notification:', error);
    }
  }

  /**
   * Setup automatic time-based notifications for a booking
   */
  setupBookingTimers(
    bookingId: string,
    chatRoomId: string,
    responseDeadline: string,
    therapistName: string,
    serviceType: string
  ): () => void {
    const deadline = new Date(responseDeadline);
    const now = new Date();
    const totalMs = deadline.getTime() - now.getTime();

    if (totalMs <= 0) {
      console.warn('⚠️ Booking deadline already passed');
      return () => {};
    }

    const timeouts: NodeJS.Timeout[] = [];

    // Schedule notifications at specific intervals
    const scheduleNotification = (beforeDeadlineMs: number, urgency: 'low' | 'medium' | 'high') => {
      const notificationTime = totalMs - beforeDeadlineMs;
      if (notificationTime > 0) {
        const timeout = setTimeout(() => {
          this.notifyTimeWarning(
            Math.floor(beforeDeadlineMs / 1000),
            therapistName,
            serviceType,
            bookingId
          );
        }, notificationTime);
        timeouts.push(timeout);
      }
    };

    // Schedule notifications: 5 min, 2 min, 1 min before deadline
    scheduleNotification(5 * 60 * 1000, 'medium'); // 5 minutes
    scheduleNotification(2 * 60 * 1000, 'medium'); // 2 minutes  
    scheduleNotification(1 * 60 * 1000, 'high');   // 1 minute

    // Schedule expiration notification
    const expirationTimeout = setTimeout(() => {
      this.notifyBookingStatus('expired', therapistName, serviceType, bookingId, chatRoomId);
    }, totalMs);
    timeouts.push(expirationTimeout);

    console.log(`⏰ Scheduled ${timeouts.length} notifications for booking ${bookingId}`);

    // Return cleanup function
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      console.log(`🧹 Cleared ${timeouts.length} notification timers for booking ${bookingId}`);
    };
  }

  /**
   * Check if user has interacted with booking notifications before
   */
  hasInteractedWithNotifications(): boolean {
    return localStorage.getItem('notification-permission-granted') === 'true';
  }

  /**
   * Show onboarding notification prompt
   */
  async showNotificationOnboarding(): Promise<boolean> {
    if (this.hasInteractedWithNotifications()) {
      return this.notificationPermission === 'granted';
    }

    // Show friendly prompt before requesting permission
    const userWantsNotifications = confirm(
      '🔔 Get notified when therapists respond to your booking requests?\n\n' +
      'We\'ll send you updates about booking status and chat messages so you never miss important information.'
    );

    if (userWantsNotifications) {
      const permission = await this.requestPermission();
      return permission === 'granted';
    } else {
      localStorage.setItem('notification-permission-granted', 'false');
      return false;
    }
  }
}

export const bookingNotificationService = new BookingNotificationService();
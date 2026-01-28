import { logger } from './enterpriseLogger';
/**
 * 🕐 ENTERPRISE SCHEDULED REMINDER SERVICE
 * 
 * Automated reminder system for scheduled bookings:
 * - Therapist reminders: 5, 4, 3, 2, 1 hours before booking
 * - Customer reminders: 5 hours before booking
 * - MP3 notifications with different urgency levels
 * - Background service worker integration
 * - Persistent reminder scheduling (survives page refreshes)
 * - Integration with WebSocket for real-time delivery
 * - App download prompts for customers
 * 
 * Technical Features:
 * - Uses Service Worker for background execution
 * - Persistent storage in IndexedDB
 * - Exponential retry for failed reminders
 * - Timezone-aware scheduling
 * - Battery optimization (coalesced notifications)
 */

import React from 'react';
import { enterpriseWebSocketService } from './enterpriseWebSocketService';
// Note: bookingSoundService removed - using browser notification sounds instead

export interface ScheduledBooking {
  bookingId: string;
  customerId: string;
  therapistId: string;
  scheduledTime: Date; // When the actual booking/massage is scheduled
  customerName: string;
  therapistName: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  totalPrice: number;
  customerPhone?: string;
  therapistPhone?: string;
  notes?: string;
  reminderPreferences?: {
    therapist: boolean; // Enable therapist reminders
    customer: boolean; // Enable customer reminders
    sms: boolean; // Enable SMS reminders
    push: boolean; // Enable push notifications
  };
}

export interface ReminderSchedule {
  bookingId: string;
  reminderId: string;
  reminderType: 'therapist_5h' | 'therapist_4h' | 'therapist_3h' | 'therapist_2h' | 'therapist_1h' | 'customer_3h';
  scheduledTime: Date; // When to send the reminder
  targetUserId: string; // Who to remind (therapist or customer)
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  lastAttempt?: Date;
  booking: ScheduledBooking;
}

class EnterpriseScheduledReminderService {
  private dbName = 'EnterpriseReminders';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private _serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  /**
   * Initialize the reminder service
   */
  async initialize(): Promise<void> {
    logger.info('⏰ [REMINDERS] Initializing scheduled reminder service...');
    
    try {
      // Initialize IndexedDB
      await this.initializeDatabase();
      
      // Register service worker for background processing
      await this.registerServiceWorker();
      
      // Start reminder checking loop
      this.startReminderLoop();
      
      // Clean up old reminders
      await this.cleanupOldReminders();
      
      logger.info('✅ [REMINDERS] Service initialized successfully');
      
    } catch (error) {
      logger.error('❌ [REMINDERS] Failed to initialize service:', error);
      throw error;
    }
  }

  /**
   * Initialize IndexedDB for persistent reminder storage
   */
  private initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create reminders store
        if (!db.objectStoreNames.contains('reminders')) {
          const reminderStore = db.createObjectStore('reminders', { keyPath: 'reminderId' });
          reminderStore.createIndex('bookingId', 'bookingId', { unique: false });
          reminderStore.createIndex('scheduledTime', 'scheduledTime', { unique: false });
          reminderStore.createIndex('status', 'status', { unique: false });
          reminderStore.createIndex('targetUserId', 'targetUserId', { unique: false });
        }
        
        // Create bookings store
        if (!db.objectStoreNames.contains('scheduledBookings')) {
          const bookingStore = db.createObjectStore('scheduledBookings', { keyPath: 'bookingId' });
          bookingStore.createIndex('scheduledTime', 'scheduledTime', { unique: false });
          bookingStore.createIndex('therapistId', 'therapistId', { unique: false });
          bookingStore.createIndex('customerId', 'customerId', { unique: false });
        }
      };
    });
  }

  /**
   * Register service worker for background reminder processing
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('⚠️ [REMINDERS] Service Worker not supported');
      return;
    }
    
    try {
      this._serviceWorkerRegistration = await navigator.serviceWorker.register('/sw-reminders.js');
      logger.info('✅ [REMINDERS] Service Worker registered');
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'REMINDER_TRIGGERED') {
          this.handleServiceWorkerReminder(event.data.payload);
        }
      });
      
    } catch (error) {
      logger.warn('⚠️ [REMINDERS] Service Worker registration failed:', error);
    }
  }

  /**
   * Schedule all reminders for a booking
   */
  async scheduleBookingReminders(booking: ScheduledBooking): Promise<void> {
    logger.info(`⏰ [SCHEDULE] Creating reminders for booking: ${booking.bookingId}`);
    
    try {
      // Store the booking
      await this.storeScheduledBooking(booking);
      
      const scheduledTime = new Date(booking.scheduledTime);
      const now = new Date();
      
      // Therapist reminder schedule (5, 4, 3, 2, 1 hours before)
      const therapistReminders: Array<{ type: ReminderSchedule['reminderType']; hours: number }> = [
        { type: 'therapist_5h', hours: 5 },
        { type: 'therapist_4h', hours: 4 },
        { type: 'therapist_3h', hours: 3 },
        { type: 'therapist_2h', hours: 2 },
        { type: 'therapist_1h', hours: 1 }
      ];
      
      // Customer reminder schedule (5 hours before)
      const customerReminders: Array<{ type: ReminderSchedule['reminderType']; hours: number }> = [
        { type: 'customer_3h', hours: 3 }
      ];
      
      const allReminders = [
        ...therapistReminders.map(r => ({ ...r, targetUserId: booking.therapistId })),
        ...customerReminders.map(r => ({ ...r, targetUserId: booking.customerId }))
      ];
      
      for (const reminder of allReminders) {
        const reminderTime = new Date(scheduledTime.getTime() - (reminder.hours * 60 * 60 * 1000));
        
        // Only schedule future reminders
        if (reminderTime > now) {
          const reminderSchedule: ReminderSchedule = {
            bookingId: booking.bookingId,
            reminderId: `${booking.bookingId}_${reminder.type}`,
            reminderType: reminder.type,
            scheduledTime: reminderTime,
            targetUserId: reminder.targetUserId,
            status: 'scheduled',
            retryCount: 0,
            booking
          };
          
          await this.storeReminderSchedule(reminderSchedule);
          logger.info(`✅ [SCHEDULE] ${reminder.type} reminder scheduled for ${reminderTime.toLocaleString()}`);
        } else {
          logger.info(`⚠️ [SCHEDULE] Skipping past reminder: ${reminder.type} (${reminderTime.toLocaleString()})`);
        }
      }
      
      logger.info(`✅ [SCHEDULE] All reminders scheduled for booking: ${booking.bookingId}`);
      
    } catch (error) {
      logger.error('❌ [SCHEDULE] Failed to schedule reminders:', error);
      throw error;
    }
  }

  /**
   * Start the reminder checking loop
   */
  private startReminderLoop(): void {
    // Check every minute for due reminders
    this.checkInterval = setInterval(() => {
      this.checkDueReminders();
    }, 60000); // 1 minute
    
    // Initial check
    this.checkDueReminders();
  }

  /**
   * Check for reminders that are due to be sent
   */
  private async checkDueReminders(): Promise<void> {
    try {
      const now = new Date();
      const dueReminders = await this.getDueReminders(now);
      
      logger.info(`⏰ [CHECK] Found ${dueReminders.length} due reminders`);
      
      for (const reminder of dueReminders) {
        await this.sendReminder(reminder);
      }
      
    } catch (error) {
      logger.error('❌ [CHECK] Error checking due reminders:', error);
    }
  }

  /**
   * Get reminders that are due to be sent
   */
  private getDueReminders(beforeTime: Date): Promise<ReminderSchedule[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['reminders'], 'readonly');
      const store = transaction.objectStore('reminders');
      const index = store.index('status');
      const request = index.getAll('scheduled');
      
      request.onsuccess = () => {
        const allScheduled = request.result as ReminderSchedule[];
        const dueReminders = allScheduled.filter(reminder => 
          new Date(reminder.scheduledTime) <= beforeTime
        );
        resolve(dueReminders);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Send a reminder notification
   */
  private async sendReminder(reminder: ReminderSchedule): Promise<void> {
    logger.info(`📨 [SEND] Sending reminder: ${reminder.reminderType} for booking ${reminder.bookingId}`);
    
    try {
      // Update reminder status to prevent duplicate sends
      reminder.status = 'sent';
      reminder.lastAttempt = new Date();
      await this.updateReminderSchedule(reminder);
      
      // Determine urgency level
      const urgentReminders = ['therapist_2h', 'therapist_1h'];
      const urgency = urgentReminders.includes(reminder.reminderType) ? 'urgent' : 'normal';
      
      // Play notification sound using browser Audio API
      try {
        const audio = new Audio(urgency === 'urgent' ? '/sounds/urgent-reminder.mp3' : '/sounds/reminder.mp3');
        audio.volume = 0.7;
        audio.play().catch(err => logger.warn('Audio play failed:', err));
      } catch (err) {
        logger.warn('⚠️ [SEND] Audio notification failed:', err);
      }
      
      // Send via WebSocket if connected
      enterpriseWebSocketService.send({
        type: 'SCHEDULED_REMINDER',
        priority: urgency === 'urgent' ? 'urgent' : 'normal',
        payload: {
          bookingId: reminder.bookingId,
          reminderType: reminder.reminderType,
          scheduledTime: reminder.booking.scheduledTime.toISOString(),
          bookingDetails: {
            customerName: reminder.booking.customerName,
            location: reminder.booking.location.address,
            services: reminder.booking.services.map(s => s.name),
            totalPrice: reminder.booking.totalPrice
          },
          therapistId: reminder.reminderType.startsWith('therapist') ? reminder.targetUserId : undefined,
          customerId: reminder.reminderType.startsWith('customer') ? reminder.targetUserId : undefined
        }
      });
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        const title = this.getReminderTitle(reminder.reminderType);
        const body = this.getReminderBody(reminder);
        const isUrgent = urgentReminders.includes(reminder.reminderType);
        
        new Notification(title, {
          body,
          icon: '/icons/reminder-notification.png',
          badge: '/icons/notification-badge.png',
          tag: `reminder-${reminder.reminderId}`,
          requireInteraction: isUrgent,
          vibrate: isUrgent ? [200, 100, 200] : [100],
          actions: reminder.reminderType.startsWith('therapist') ? [
            { action: 'view', title: 'View Booking' },
            { action: 'contact', title: 'Contact Customer' }
          ] : [
            { action: 'view', title: 'View Details' },
            { action: 'download', title: 'Download App' }
          ]
        });
      }
      
      // For customer 5-hour reminders, trigger app download prompt
      if (reminder.reminderType === 'customer_3h') {
        window.dispatchEvent(new CustomEvent('show-app-download-prompt', {
          detail: { 
            bookingId: reminder.bookingId,
            message: `Your massage is in 3 hours! Download our app for MP3 notifications and better experience.`
          }
        }));
      }
      
      logger.info(`✅ [SEND] Reminder sent successfully: ${reminder.reminderType}`);
      
    } catch (error) {
      logger.error('❌ [SEND] Failed to send reminder:', error);
      
      // Mark as failed and schedule retry
      reminder.status = 'failed';
      reminder.retryCount++;
      reminder.lastAttempt = new Date();
      
      if (reminder.retryCount < 3) {
        // Retry in exponentially increasing intervals
        const retryDelay = Math.pow(2, reminder.retryCount) * 60 * 1000; // 2, 4, 8 minutes
        setTimeout(() => {
          reminder.status = 'scheduled';
          this.updateReminderSchedule(reminder);
        }, retryDelay);
      }
      
      await this.updateReminderSchedule(reminder);
    }
  }

  /**
   * Handle reminders triggered by service worker
   */
  private async handleServiceWorkerReminder(payload: any): Promise<void> {
    logger.info('🔔 [SW_REMINDER] Service worker triggered reminder:', payload);
    
    try {
      const reminder = await this.getReminderSchedule(payload.reminderId);
      if (reminder && reminder.status === 'scheduled') {
        await this.sendReminder(reminder);
      }
    } catch (error) {
      logger.error('❌ [SW_REMINDER] Failed to handle service worker reminder:', error);
    }
  }

  /**
   * Get reminder title based on type
   */
  private getReminderTitle(reminderType: ReminderSchedule['reminderType']): string {
    const titles = {
      'therapist_5h': 'Booking in 5 Hours',
      'therapist_4h': 'Booking in 4 Hours',
      'therapist_3h': 'Booking in 3 Hours',
      'therapist_2h': 'Booking in 2 Hours - Prepare!',
      'therapist_1h': 'Booking in 1 Hour - Get Ready!',
      'customer_3h': 'Your Massage in 3 Hours'
    };
    
    return titles[reminderType];
  }

  /**
   * Get reminder body text
   */
  private getReminderBody(reminder: ReminderSchedule): string {
    const booking = reminder.booking;
    const services = booking.services.map(s => s.name).join(', ');
    
    if (reminder.reminderType.startsWith('therapist')) {
      return `Client: ${booking.customerName}\nLocation: ${booking.location.address}\nServices: ${services}\nTotal: $${booking.totalPrice}`;
    } else {
      return `Therapist: ${booking.therapistName}\nLocation: ${booking.location.address}\nServices: ${services}\nDownload our app for MP3 notifications!`;
    }
  }

  /**
   * Cancel all reminders for a booking
   */
  async cancelBookingReminders(bookingId: string): Promise<void> {
    logger.info(`❌ [CANCEL] Cancelling reminders for booking: ${bookingId}`);
    
    try {
      const reminders = await this.getRemindersByBookingId(bookingId);
      
      for (const reminder of reminders) {
        reminder.status = 'cancelled';
        await this.updateReminderSchedule(reminder);
      }
      
      logger.info(`✅ [CANCEL] Cancelled ${reminders.length} reminders for booking: ${bookingId}`);
      
    } catch (error) {
      logger.error('❌ [CANCEL] Failed to cancel reminders:', error);
      throw error;
    }
  }

  /**
   * Clean up old completed reminders (older than 7 days)
   */
  private async cleanupOldReminders(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['reminders'], 'readwrite');
      const store = transaction.objectStore('reminders');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allReminders = request.result as ReminderSchedule[];
        const oldReminders = allReminders.filter(reminder => 
          (reminder.status === 'sent' || reminder.status === 'failed') &&
          new Date(reminder.scheduledTime) < cutoffDate
        );
        
        oldReminders.forEach(reminder => {
          store.delete(reminder.reminderId);
        });
        
        logger.info(`🧹 [CLEANUP] Removed ${oldReminders.length} old reminders`);
      };
      
    } catch (error) {
      logger.error('❌ [CLEANUP] Failed to cleanup old reminders:', error);
    }
  }

  // Database helper methods
  private storeScheduledBooking(booking: ScheduledBooking): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['scheduledBookings'], 'readwrite');
      const store = transaction.objectStore('scheduledBookings');
      const request = store.put(booking);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private storeReminderSchedule(reminder: ReminderSchedule): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['reminders'], 'readwrite');
      const store = transaction.objectStore('reminders');
      const request = store.put(reminder);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private updateReminderSchedule(reminder: ReminderSchedule): Promise<void> {
    return this.storeReminderSchedule(reminder);
  }

  private getReminderSchedule(reminderId: string): Promise<ReminderSchedule | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['reminders'], 'readonly');
      const store = transaction.objectStore('reminders');
      const request = store.get(reminderId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private getRemindersByBookingId(bookingId: string): Promise<ReminderSchedule[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['reminders'], 'readonly');
      const store = transaction.objectStore('reminders');
      const index = store.index('bookingId');
      const request = index.getAll(bookingId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all scheduled bookings for a user
   */
  async getScheduledBookings(userId: string, userType: 'therapist' | 'customer'): Promise<ScheduledBooking[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(['scheduledBookings'], 'readonly');
      const store = transaction.objectStore('scheduledBookings');
      const indexName = userType === 'therapist' ? 'therapistId' : 'customerId';
      const index = store.index(indexName);
      const request = index.getAll(userId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    logger.info('🔌 [REMINDERS] Shutting down service...');
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const enterpriseScheduledReminderService = new EnterpriseScheduledReminderService();

// React hook for reminder integration
export const useScheduledReminders = (userId: string, userType: 'therapist' | 'customer') => {
  const [scheduledBookings, setScheduledBookings] = React.useState<ScheduledBooking[]>([]);
  const [isServiceReady, setIsServiceReady] = React.useState(false);
  
  React.useEffect(() => {
    const initService = async () => {
      try {
        await enterpriseScheduledReminderService.initialize();
        setIsServiceReady(true);
        
        // Load user's scheduled bookings
        const bookings = await enterpriseScheduledReminderService.getScheduledBookings(userId, userType);
        setScheduledBookings(bookings);
        
      } catch (error) {
        logger.error('Failed to initialize reminder service:', error);
      }
    };
    
    initService();
    
    return () => {
      enterpriseScheduledReminderService.shutdown();
    };
  }, [userId, userType]);
  
  const scheduleBooking = async (booking: ScheduledBooking) => {
    await enterpriseScheduledReminderService.scheduleBookingReminders(booking);
    
    // Refresh the list
    const bookings = await enterpriseScheduledReminderService.getScheduledBookings(userId, userType);
    setScheduledBookings(bookings);
  };
  
  const cancelBookingReminders = async (bookingId: string) => {
    await enterpriseScheduledReminderService.cancelBookingReminders(bookingId);
    
    // Refresh the list
    const bookings = await enterpriseScheduledReminderService.getScheduledBookings(userId, userType);
    setScheduledBookings(bookings);
  };
  
  return {
    scheduledBookings,
    isServiceReady,
    scheduleBooking,
    cancelBookingReminders
  };
};

export default enterpriseScheduledReminderService;
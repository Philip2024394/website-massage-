/**
 * ============================================================================
 * 💳 PAYMENT SERVICE & 🔔 NOTIFICATION SERVICE
 * ============================================================================
 * 
 * Supporting services for the core booking system.
 * 
 * ============================================================================
 */

import { 
  databases, 
  DATABASE_ID, 
  COLLECTION_IDS, 
  ID 
} from '../clients/appwrite';

// Payment Service
export class PaymentService {
  
  static async calculateCost(serviceType: string, duration: number, extras?: any): Promise<{
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  }> {
    const basePrices = {
      massage: { 60: 300000, 90: 450000, 120: 600000 },
      facial: { 60: 250000, 90: 375000, 120: 500000 },
      spa: { 60: 400000, 90: 600000, 120: 800000 }
    };

    const subtotal = basePrices[serviceType]?.[duration] || 300000;
    const tax = Math.round(subtotal * 0.11); // 11% tax
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      currency: 'IDR'
    };
  }

  static async processPayment(bookingId: string, paymentData: {
    amount: number;
    method: 'cash' | 'transfer' | 'ewallet' | 'card';
    reference?: string;
  }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Mock payment processing
      console.log('💳 [PAYMENT] Processing payment for booking:', bookingId);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transactionId = `TXN_${Date.now()}`;
      
      return {
        success: true,
        transactionId
      };
    } catch (error) {
      console.error('❌ [PAYMENT] Payment processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }
}

// Notification Service  
export interface Notification {
  id?: string;
  userId: string;
  userType: 'customer' | 'therapist' | 'admin';
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'review_request' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  channels: ('push' | 'whatsapp' | 'email' | 'sms')[];
}

export class NotificationService {
  
  static async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<boolean> {
    try {
      console.log('🔔 [NOTIFICATION] Sending notification:', notification.type);
      
      const notificationData = {
        userId: notification.userId,
        userType: notification.userType,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        read: false,
        createdAt: new Date().toISOString(),
        channels: notification.channels
      };

      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.notifications,
        ID.unique(),
        notificationData
      );

      // TODO: Implement actual notification sending (WhatsApp, email, etc.)
      console.log('✅ [NOTIFICATION] Notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to send notification:', error);
      return false;
    }
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.notifications,
        notificationId,
        { read: true }
      );

      return true;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to mark as read:', error);
      return false;
    }
  }

  static async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      const queries = [
        databases.equal('userId', userId),
        databases.orderDesc('$createdAt')
      ];

      if (unreadOnly) {
        queries.push(databases.equal('read', false));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.notifications,
        queries
      );

      return response.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId,
        userType: doc.userType,
        type: doc.type,
        title: doc.title,
        message: doc.message,
        data: doc.data,
        read: doc.read,
        createdAt: new Date(doc.createdAt),
        channels: doc.channels
      }));
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to get notifications:', error);
      return [];
    }
  }

  // Helper methods for common notification types
  static async notifyBookingCreated(bookingId: string, customerPhone: string, therapistId?: string): Promise<void> {
    // Notify customer
    await NotificationService.sendNotification({
      userId: customerPhone,
      userType: 'customer',
      type: 'booking_created',
      title: 'Booking Created',
      message: 'Your massage booking has been created and we are finding the best therapist for you.',
      data: { bookingId },
      channels: ['whatsapp']
    });

    // Notify therapist if assigned
    if (therapistId) {
      await NotificationService.sendNotification({
        userId: therapistId,
        userType: 'therapist',
        type: 'booking_created',
        title: 'New Booking Request',
        message: 'You have received a new booking request. Please respond within 10 minutes.',
        data: { bookingId },
        channels: ['push', 'whatsapp']
      });
    }
  }

  static async notifyBookingConfirmed(bookingId: string, customerPhone: string, therapistId: string): Promise<void> {
    // Notify customer
    await NotificationService.sendNotification({
      userId: customerPhone,
      userType: 'customer',
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: 'Great news! Your massage booking has been confirmed. Your therapist will arrive soon.',
      data: { bookingId, therapistId },
      channels: ['whatsapp']
    });
  }
}

// Export services
export { PaymentService, NotificationService };

// Export convenience functions
export const calculateCost = PaymentService.calculateCost;
export const processPayment = PaymentService.processPayment;
export const sendNotification = NotificationService.sendNotification;
export const notifyBookingCreated = NotificationService.notifyBookingCreated;
export const notifyBookingConfirmed = NotificationService.notifyBookingConfirmed;

console.log('💳🔔 [CORE] Payment & Notification services loaded');
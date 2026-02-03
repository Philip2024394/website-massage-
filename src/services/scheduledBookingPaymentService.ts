/**
 * Scheduled Booking Payment Service
 * Handles payment confirmation workflow for scheduled bookings
 */

import { databases, storage, ID } from '../lib/appwrite';
import { logger } from '../lib/logger';

export interface BankDetails {
  id: string;
  providerId: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic';
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  qrisCode?: string; // For digital payment methods
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConfirmationRequest {
  bookingId: string;
  providerId: string;
  providerName: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic';
  customerId: string;
  customerName: string;
  totalAmount: number;
  depositAmount: number; // 30% of total
  scheduledDate: string;
  scheduledTime: string;
  serviceType: string;
  duration: number;
}

export interface PaymentScreenshot {
  id: string;
  bookingId: string;
  customerId: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'pending' | 'confirmed' | 'rejected';
  confirmedBy?: string;
  confirmedAt?: string;
}

export interface BookingCalendarEntry {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceType: string;
  duration: number;
  status: 'confirmed' | 'pending_payment' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'completed';
  depositAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

class ScheduledBookingPaymentService {
  private readonly DEPOSIT_PERCENTAGE = 0.30; // 30% deposit
  private readonly NOTIFICATION_ADVANCE_HOURS = 3; // 3 hours before appointment

  /**
   * Handle scheduled booking acceptance and initiate payment workflow
   */
  async handleScheduledBookingAcceptance(request: PaymentConfirmationRequest): Promise<{
    success: boolean;
    bankDetails?: BankDetails;
    calendarEntry?: BookingCalendarEntry;
    message: string;
  }> {
    try {
      logger.info('🏦 Processing scheduled booking acceptance:', request.bookingId);

      // 1. Get provider's bank details
      const bankDetails = await this.getProviderBankDetails(request.providerId, request.providerType);
      
      if (!bankDetails) {
        return {
          success: false,
          message: 'Provider bank details not found. Please contact support.'
        };
      }

      // 2. Create calendar entry
      const calendarEntry = await this.createCalendarEntry(request);

      // 3. Schedule reminder notifications
      await this.scheduleReminderNotifications(request);

      // 4. Create payment tracking record
      await this.createPaymentTrackingRecord(request);

      return {
        success: true,
        bankDetails,
        calendarEntry,
        message: 'Payment details ready. Please transfer 30% deposit to confirm booking.'
      };

    } catch (error) {
      logger.error('❌ Scheduled booking acceptance failed:', error);
      return {
        success: false,
        message: 'Unable to process booking acceptance. Please try again.'
      };
    }
  }

  /**
   * Get provider's active bank details
   */
  private async getProviderBankDetails(providerId: string, providerType: string): Promise<BankDetails | null> {
    try {
      const bankDetailsResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'provider_bank_details',
        [
          `providerId=${providerId}`,
          `providerType=${providerType}`,
          'isActive=true'
        ]
      );

      if (bankDetailsResponse.documents.length === 0) {
        return null;
      }

      return bankDetailsResponse.documents[0] as unknown as BankDetails;

    } catch (error) {
      logger.error('❌ Error fetching bank details:', error);
      return null;
    }
  }

  /**
   * Create booking calendar entry
   */
  private async createCalendarEntry(request: PaymentConfirmationRequest): Promise<BookingCalendarEntry> {
    const calendarEntry: Omit<BookingCalendarEntry, 'id'> = {
      bookingId: request.bookingId,
      providerId: request.providerId,
      customerId: request.customerId,
      scheduledDate: request.scheduledDate,
      scheduledTime: request.scheduledTime,
      serviceType: request.serviceType,
      duration: request.duration,
      status: 'pending_payment',
      paymentStatus: 'pending',
      depositAmount: request.depositAmount,
      totalAmount: request.totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'booking_calendar',
      ID.unique(),
      calendarEntry
    );

    return response as unknown as BookingCalendarEntry;
  }

  /**
   * Schedule reminder notifications 3 hours before appointment
   */
  private async scheduleReminderNotifications(request: PaymentConfirmationRequest): Promise<void> {
    try {
      const scheduledDateTime = new Date(`${request.scheduledDate} ${request.scheduledTime}`);
      const reminderDateTime = new Date(scheduledDateTime.getTime() - (this.NOTIFICATION_ADVANCE_HOURS * 60 * 60 * 1000));

      // Create scheduled notification record
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'scheduled_notifications',
        ID.unique(),
        {
          bookingId: request.bookingId,
          providerId: request.providerId,
          customerId: request.customerId,
          notificationType: 'appointment_reminder',
          scheduledFor: reminderDateTime.toISOString(),
          appointmentDateTime: scheduledDateTime.toISOString(),
          message: `🔔 Appointment reminder: ${request.serviceType} with ${request.providerName} in 3 hours`,
          soundEnabled: true,
          status: 'scheduled',
          createdAt: new Date().toISOString()
        }
      );

      logger.info('⏰ Reminder notification scheduled:', {
        bookingId: request.bookingId,
        reminderTime: reminderDateTime.toISOString()
      });

    } catch (error) {
      logger.error('❌ Failed to schedule reminder:', error);
    }
  }

  /**
   * Create payment tracking record
   */
  private async createPaymentTrackingRecord(request: PaymentConfirmationRequest): Promise<void> {
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'payment_tracking',
      ID.unique(),
      {
        bookingId: request.bookingId,
        customerId: request.customerId,
        providerId: request.providerId,
        totalAmount: request.totalAmount,
        depositAmount: request.depositAmount,
        depositPercentage: this.DEPOSIT_PERCENTAGE,
        paymentStatus: 'awaiting_deposit',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours to pay
      }
    );
  }

  /**
   * Handle payment screenshot upload
   */
  async uploadPaymentScreenshot(
    bookingId: string,
    customerId: string,
    file: File
  ): Promise<{ success: boolean; screenshot?: PaymentScreenshot; message: string }> {
    try {
      logger.info('📸 Uploading payment screenshot for booking:', bookingId);

      // Upload file to Appwrite storage
      const fileResponse = await storage.createFile(
        'payment_screenshots', // Bucket ID
        ID.unique(),
        file
      );

      // Get file URL
      const fileUrl = storage.getFileView('payment_screenshots', fileResponse.$id);

      // Create screenshot record
      const screenshot = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'payment_screenshots',
        ID.unique(),
        {
          bookingId,
          customerId,
          fileId: fileResponse.$id,
          fileName: file.name,
          fileUrl: fileUrl.toString(),
          uploadedAt: new Date().toISOString(),
          status: 'pending'
        }
      );

      // Update payment tracking
      await this.updatePaymentStatus(bookingId, 'screenshot_uploaded');

      return {
        success: true,
        screenshot: screenshot as unknown as PaymentScreenshot,
        message: 'Payment screenshot uploaded successfully. Awaiting provider confirmation.'
      };

    } catch (error) {
      logger.error('❌ Screenshot upload failed:', error);
      return {
        success: false,
        message: 'Failed to upload screenshot. Please try again.'
      };
    }
  }

  /**
   * Confirm payment screenshot (provider action)
   */
  async confirmPaymentScreenshot(
    screenshotId: string,
    providerId: string,
    confirmed: boolean
  ): Promise<{ success: boolean; message: string }> {
    try {
      const status = confirmed ? 'confirmed' : 'rejected';
      
      // Update screenshot status
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'payment_screenshots',
        screenshotId,
        {
          status,
          confirmedBy: providerId,
          confirmedAt: new Date().toISOString()
        }
      );

      // Get screenshot to update related booking
      const screenshot = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'payment_screenshots',
        screenshotId
      );

      if (confirmed) {
        // Update booking calendar to confirmed status
        await this.updateBookingStatus(screenshot.bookingId, 'confirmed');
        await this.updatePaymentStatus(screenshot.bookingId, 'deposit_confirmed');
      }

      return {
        success: true,
        message: confirmed 
          ? 'Payment confirmed! Booking is now scheduled.' 
          : 'Payment rejected. Customer will be notified.'
      };

    } catch (error) {
      logger.error('❌ Payment confirmation failed:', error);
      return {
        success: false,
        message: 'Failed to confirm payment. Please try again.'
      };
    }
  }

  /**
   * Update booking status in calendar
   */
  private async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    try {
      const calendarEntries = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'booking_calendar',
        [`bookingId=${bookingId}`]
      );

      if (calendarEntries.documents.length > 0) {
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'booking_calendar',
          calendarEntries.documents[0].$id,
          {
            status,
            updatedAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      logger.error('❌ Failed to update booking status:', error);
    }
  }

  /**
   * Update payment status
   */
  private async updatePaymentStatus(bookingId: string, paymentStatus: string): Promise<void> {
    try {
      const paymentRecords = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'payment_tracking',
        [`bookingId=${bookingId}`]
      );

      if (paymentRecords.documents.length > 0) {
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'payment_tracking',
          paymentRecords.documents[0].$id,
          {
            paymentStatus,
            updatedAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      logger.error('❌ Failed to update payment status:', error);
    }
  }

  /**
   * Get upcoming appointments for reminder notifications
   */
  async getUpcomingAppointments(): Promise<BookingCalendarEntry[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + (this.NOTIFICATION_ADVANCE_HOURS * 60 * 60 * 1000));

    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'booking_calendar',
        [
          'status=confirmed',
          `scheduledDate>=${now.toISOString().split('T')[0]}`,
          `scheduledDate<=${futureTime.toISOString().split('T')[0]}`
        ]
      );

      return response.documents as unknown as BookingCalendarEntry[];

    } catch (error) {
      logger.error('❌ Error fetching upcoming appointments:', error);
      return [];
    }
  }

  /**
   * Send appointment reminder with MP3 sound
   */
  async sendAppointmentReminder(calendarEntry: BookingCalendarEntry): Promise<void> {
    try {
      // Create reminder notification for customer
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'real_time_notifications',
        ID.unique(),
        {
          userId: calendarEntry.customerId,
          notificationType: 'appointment_reminder',
          title: '🔔 Appointment Reminder',
          message: `Your ${calendarEntry.serviceType} appointment is in 3 hours`,
          soundEnabled: true,
          soundFile: 'appointment_reminder.mp3',
          priority: 'high',
          scheduledDateTime: `${calendarEntry.scheduledDate} ${calendarEntry.scheduledTime}`,
          createdAt: new Date().toISOString(),
          status: 'sent'
        }
      );

      // Create reminder notification for provider
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'real_time_notifications',
        ID.unique(),
        {
          userId: calendarEntry.providerId,
          notificationType: 'appointment_reminder',
          title: '🔔 Appointment Reminder',
          message: `You have an appointment in 3 hours`,
          soundEnabled: true,
          soundFile: 'appointment_reminder.mp3',
          priority: 'high',
          scheduledDateTime: `${calendarEntry.scheduledDate} ${calendarEntry.scheduledTime}`,
          createdAt: new Date().toISOString(),
          status: 'sent'
        }
      );

      logger.info('🔔 Appointment reminders sent:', calendarEntry.bookingId);

    } catch (error) {
      logger.error('❌ Failed to send appointment reminder:', error);
    }
  }
}

export const scheduledBookingPaymentService = new ScheduledBookingPaymentService();
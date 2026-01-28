/**
 * 🔄 SCHEDULED BOOKING PAYMENT SERVICE
 * 
 * Comprehensive payment system for scheduled bookings with:
 * - 30% deposit collection from customers
 * - Payment verification & non-refundable policy
 * - Dashboard integration & notifications
 * - No-show penalty tracking (policy enforcement)
 * 
 * NOTE: Admin approval required for deposit payout to providers.
 * Remaining balance (70%) collected manually at service completion.
 */

import { databases, ID, Query, storage } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ScheduledBookingDeposit {
  $id?: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  therapistId: string;
  therapistName: string;
  providerType: 'therapist' | 'place';
  
  // Service details
  serviceType: string;
  duration: number;
  totalPrice: number;
  depositAmount: number; // 30% of totalPrice
  remainingAmount: number; // 70% to be paid on completion
  
  // Scheduled booking details
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  
  // Deposit payment details
  depositStatus: 'pending' | 'paid' | 'approved' | 'rejected' | 'refunded';
  paymentMethod: 'bank_transfer' | 'credit_card' | 'e_wallet';
  paymentProofUrl?: string;
  paidAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  
  // Provider payout details
  payoutStatus: 'pending' | 'processed' | 'completed';
  payoutAmount: number; // 30% deposit to provider immediately
  payoutDate?: string;
  payoutReference?: string;
  
  // Non-refundable policy tracking
  isNonRefundable: boolean;
  policyAcknowledgedAt: string;
  
  // No-show tracking
  noShowStatus: 'none' | 'reported' | 'confirmed';
  noShowReportedAt?: string;
  penaltyApplied: boolean;
  
  // Notifications & reminders
  remindersSent: string[]; // timestamps of sent reminders
  lastReminderAt?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface TherapistBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface PaymentNotification {
  type: 'deposit_paid' | 'deposit_approved' | 'payout_sent' | 'reminder_5h' | 'no_show';
  recipientId: string;
  recipientType: 'customer' | 'therapist' | 'admin';
  title: string;
  message: string;
  urgent: boolean;
  bookingId: string;
}

// ============================================================================
// SCHEDULED BOOKING PAYMENT SERVICE
// ============================================================================

class ScheduledBookingPaymentService {
  private readonly DEPOSIT_PERCENTAGE = 0.30; // 30% deposit required
  private readonly NOTIFICATION_HOURS_BEFORE = 5; // 5 hours before booking
  
  /**
   * Create scheduled booking with deposit requirement
   */
  async createScheduledBookingWithDeposit(data: {
    bookingId: string;
    customerId: string;
    customerName: string;
    therapistId: string;
    therapistName: string;
    providerType: 'therapist' | 'place';
    serviceType: string;
    duration: number;
    totalPrice: number;
    scheduledDate: string;
    scheduledTime: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<ScheduledBookingDeposit> {
    try {
      const depositAmount = Math.round(data.totalPrice * this.DEPOSIT_PERCENTAGE);
      const remainingAmount = data.totalPrice - depositAmount;
      const payoutAmount = depositAmount; // Provider gets 30% immediately after approval
      
      const deposit: ScheduledBookingDeposit = {
        bookingId: data.bookingId,
        customerId: data.customerId,
        customerName: data.customerName,
        therapistId: data.therapistId,
        therapistName: data.therapistName,
        providerType: data.providerType,
        serviceType: data.serviceType,
        duration: data.duration,
        totalPrice: data.totalPrice,
        depositAmount,
        remainingAmount,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        location: data.location,
        coordinates: data.coordinates,
        
        // Payment status
        depositStatus: 'pending',
        paymentMethod: 'bank_transfer', // Default, customer can change
        payoutStatus: 'pending',
        payoutAmount,
        
        // Non-refundable policy
        isNonRefundable: true,
        policyAcknowledgedAt: new Date().toISOString(),
        
        // No-show tracking
        noShowStatus: 'none',
        penaltyApplied: false,
        
        // Notifications
        remindersSent: [],
        
        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        ID.unique(),
        deposit
      );
      
      // Schedule 5-hour reminder notification
      this.scheduleBookingReminder(result.$id, data.scheduledDate, data.scheduledTime);
      
      // Notify customer about deposit requirement
      await this.sendNotification({
        type: 'deposit_paid',
        recipientId: data.customerId,
        recipientType: 'customer',
        title: 'Deposit Required for Scheduled Booking',
        message: `Please pay 30% deposit (${this.formatPrice(depositAmount)}) to confirm your ${data.serviceType} booking on ${data.scheduledDate}. Deposits are non-refundable.`,
        urgent: true,
        bookingId: data.bookingId
      });
      
      console.log(`💰 [ScheduledPayment] Created deposit requirement: ${depositAmount} IDR (30%)`);
      console.log(`📅 [ScheduledPayment] Scheduled for: ${data.scheduledDate} ${data.scheduledTime}`);
      
      return { ...deposit, $id: result.$id };
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to create deposit requirement:', error);
      throw error;
    }
  }
  
  /**
   * Process deposit payment from customer
   */
  async processDepositPayment(
    depositId: string,
    paymentProofFile: File,
    paymentMethod: 'bank_transfer' | 'credit_card' | 'e_wallet',
    notes?: string
  ): Promise<void> {
    try {
      // Upload payment proof
      const fileId = ID.unique();
      const uploadResult = await storage.createFile(
        'payment_proofs',
        fileId,
        paymentProofFile
      );
      
      const paymentProofUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/payment_proofs/files/${fileId}/view`;
      
      // Update deposit record
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        depositId,
        {
          depositStatus: 'paid',
          paymentMethod,
          paymentProofUrl,
          paidAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      
      // Get deposit details for notifications
      const deposit = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        depositId
      ) as ScheduledBookingDeposit;
      
      // Notify therapist about deposit payment
      await this.sendNotification({
        type: 'deposit_paid',
        recipientId: deposit.therapistId,
        recipientType: 'therapist',
        title: 'Customer Paid Deposit',
        message: `${deposit.customerName} paid ${this.formatPrice(deposit.depositAmount)} deposit for ${deposit.serviceType} on ${deposit.scheduledDate}. Please review and approve.`,
        urgent: false,
        bookingId: deposit.bookingId
      });
      
      // Notify admin for approval
      await this.sendNotification({
        type: 'deposit_paid',
        recipientId: 'admin',
        recipientType: 'admin',
        title: 'Deposit Payment Awaiting Approval',
        message: `${deposit.customerName} → ${deposit.therapistName}: ${this.formatPrice(deposit.depositAmount)} deposit for ${deposit.serviceType}`,
        urgent: false,
        bookingId: deposit.bookingId
      });
      
      console.log(`✅ [ScheduledPayment] Deposit payment processed for booking ${deposit.bookingId}`);
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to process deposit payment:', error);
      throw error;
    }
  }
  
  /**
   * Approve deposit (admin approval required for payout processing)
   */
  async approveDepositAndPayout(
    depositId: string,
    approvedBy: string
  ): Promise<void> {
    try {
      const deposit = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        depositId
      ) as ScheduledBookingDeposit;
      
      // Get therapist bank details
      const therapist = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.therapistsCollection,
        deposit.therapistId
      );
      
      const bankDetails: TherapistBankDetails = {
        bankName: therapist.bankName,
        accountName: therapist.accountName,
        accountNumber: therapist.accountNumber,
        swiftCode: therapist.swiftCode,
        isVerified: true,
        verifiedAt: therapist.bankVerifiedAt
      };
      
      if (!bankDetails.accountNumber) {
        throw new Error('Therapist bank details not complete');
      }
      
      // Update deposit status
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        depositId,
        {
          depositStatus: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy,
          payoutStatus: 'processed',
          payoutDate: new Date().toISOString(),
          payoutReference: `PAYOUT_${Date.now()}`,
          updatedAt: new Date().toISOString()
        }
      );
      
      // Create payout transaction record
      await this.createPayoutRecord(deposit, bankDetails);
      
      // Notify customer that booking is confirmed
      await this.sendNotification({
        type: 'deposit_approved',
        recipientId: deposit.customerId,
        recipientType: 'customer',
        title: 'Booking Confirmed',
        message: `Your ${deposit.serviceType} booking with ${deposit.therapistName} is confirmed for ${deposit.scheduledDate} at ${deposit.scheduledTime}. You will receive a reminder 5 hours before your appointment.`,
        urgent: false,
        bookingId: deposit.bookingId
      });
      
      // Notify therapist that payout is processed
      await this.sendNotification({
        type: 'payout_sent',
        recipientId: deposit.therapistId,
        recipientType: 'therapist',
        title: 'Deposit Payout Sent',
        message: `${this.formatPrice(deposit.payoutAmount)} has been sent to your ${bankDetails.bankName} account ending in ${bankDetails.accountNumber.slice(-4)} for booking on ${deposit.scheduledDate}.`,
        urgent: false,
        bookingId: deposit.bookingId
      });
      
      // Display bank card in chat
      await this.displayBankCardInChat(deposit, bankDetails);
      
      console.log(`💳 [ScheduledPayment] Payout sent: ${deposit.payoutAmount} IDR to ${deposit.therapistName}`);
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to approve deposit and payout:', error);
      throw error;
    }
  }
  
  /**
   * Schedule 5-hour reminder notification
   */
  private scheduleBookingReminder(
    depositId: string,
    scheduledDate: string,
    scheduledTime: string
  ): void {
    try {
      const bookingDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const reminderTime = new Date(bookingDateTime.getTime() - (this.NOTIFICATION_HOURS_BEFORE * 60 * 60 * 1000));
      const now = new Date();
      
      if (reminderTime > now) {
        const timeoutMs = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
          this.sendBookingReminder(depositId);
        }, timeoutMs);
        
        console.log(`⏰ [ScheduledPayment] Reminder scheduled for ${this.NOTIFICATION_HOURS_BEFORE}h before booking`);
      }
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to schedule reminder:', error);
    }
  }
  
  /**
   * Send 5-hour reminder to both customer and therapist
   */
  private async sendBookingReminder(depositId: string): Promise<void> {
    try {
      const deposit = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        depositId
      ) as ScheduledBookingDeposit;
      
      const reminderTime = new Date().toISOString();
      
      // Update reminders sent
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        depositId,
        {
          remindersSent: [...deposit.remindersSent, reminderTime],
          lastReminderAt: reminderTime,
          updatedAt: new Date().toISOString()
        }
      );
      
      // Notify customer
      await this.sendNotification({
        type: 'reminder_5h',
        recipientId: deposit.customerId,
        recipientType: 'customer',
        title: 'Upcoming Appointment Reminder',
        message: `Your ${deposit.serviceType} appointment with ${deposit.therapistName} is in 5 hours at ${deposit.scheduledTime}. Location: ${deposit.location}. Remember: deposits are non-refundable.`,
        urgent: true,
        bookingId: deposit.bookingId
      });
      
      // Notify therapist
      await this.sendNotification({
        type: 'reminder_5h',
        recipientId: deposit.therapistId,
        recipientType: 'therapist',
        title: 'Upcoming Booking Reminder',
        message: `You have a ${deposit.serviceType} appointment with ${deposit.customerName} in 5 hours at ${deposit.scheduledTime}. Location: ${deposit.location}.`,
        urgent: true,
        bookingId: deposit.bookingId
      });
      
      console.log(`🔔 [ScheduledPayment] 5-hour reminders sent for booking ${deposit.bookingId}`);
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to send booking reminder:', error);
    }
  }
  
  /**
   * Handle no-show scenario
   */
  async reportNoShow(
    depositId: string,
    reportedBy: 'customer' | 'therapist',
    reason: string
  ): Promise<void> {
    try {
      const deposit = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        depositId
      ) as ScheduledBookingDeposit;
      
      // Update no-show status
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        depositId,
        {
          noShowStatus: 'confirmed',
          noShowReportedAt: new Date().toISOString(),
          penaltyApplied: true,
          updatedAt: new Date().toISOString()
        }
      );
      
      // Notify customer about deposit forfeiture
      await this.sendNotification({
        type: 'no_show',
        recipientId: deposit.customerId,
        recipientType: 'customer',
        title: 'Booking No-Show - Deposit Forfeited',
        message: `Your ${this.formatPrice(deposit.depositAmount)} deposit for the ${deposit.serviceType} appointment on ${deposit.scheduledDate} has been forfeited due to no-show. Deposits are non-refundable as per our policy.`,
        urgent: true,
        bookingId: deposit.bookingId
      });
      
      // Notify therapist
      await this.sendNotification({
        type: 'no_show',
        recipientId: deposit.therapistId,
        recipientType: 'therapist',
        title: 'Customer No-Show Confirmed',
        message: `${deposit.customerName} did not show up for the ${deposit.serviceType} appointment. You will keep the ${this.formatPrice(deposit.payoutAmount)} deposit payment.`,
        urgent: false,
        bookingId: deposit.bookingId
      });
      
      console.log(`❌ [ScheduledPayment] No-show penalty applied for booking ${deposit.bookingId}`);
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to report no-show:', error);
      throw error;
    }
  }
  
  /**
   * Create payout record for accounting
   */
  private async createPayoutRecord(
    deposit: ScheduledBookingDeposit,
    bankDetails: TherapistBankDetails
  ): Promise<void> {
    try {
      const payoutRecord = {
        depositId: deposit.$id,
        bookingId: deposit.bookingId,
        therapistId: deposit.therapistId,
        therapistName: deposit.therapistName,
        amount: deposit.payoutAmount,
        bankName: bankDetails.bankName,
        accountName: bankDetails.accountName,
        accountNumber: bankDetails.accountNumber,
        payoutReference: `PAYOUT_${Date.now()}`,
        status: 'sent',
        createdAt: new Date().toISOString()
      };
      
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'therapist_payouts',
        ID.unique(),
        payoutRecord
      );
      
      console.log(`📊 [ScheduledPayment] Payout record created`);
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to create payout record:', error);
    }
  }
  
  /**
   * Display therapist's bank card in chat after booking acceptance
   */
  private async displayBankCardInChat(
    deposit: ScheduledBookingDeposit,
    bankDetails: TherapistBankDetails
  ): Promise<void> {
    try {
      // Import chat service dynamically
      const { serverEnforcedChatService } = await import('./serverEnforcedChatService');
      
      const bankCardMessage = `💳 THERAPIST BANK DETAILS
      
✅ Booking Confirmed - Remaining Balance: ${this.formatPrice(deposit.remainingAmount)}

🏦 Bank Information:
• Bank: ${bankDetails.bankName}
• Account Name: ${bankDetails.accountName}
• Account Number: ${bankDetails.accountNumber}
${bankDetails.swiftCode ? `• SWIFT Code: ${bankDetails.swiftCode}` : ''}

⚠️ IMPORTANT:
• Pay remaining ${this.formatPrice(deposit.remainingAmount)} after service completion
• Only pay to these exact bank details
• Your ${this.formatPrice(deposit.depositAmount)} deposit is non-refundable
• Report any suspicious payment requests immediately`;

      // Send to chat room
      const chatRoomId = `${deposit.customerId}_${deposit.therapistId}`;
      
      await serverEnforcedChatService.sendMessage({
        conversationId: chatRoomId,
        senderId: 'system',
        senderName: 'IndaStreet System',
        senderRole: 'admin',
        receiverId: deposit.customerId,
        receiverName: deposit.customerName,
        receiverRole: 'customer',
        message: bankCardMessage,
        messageType: 'bank_card'
      });
      
      console.log(`💳 [ScheduledPayment] Bank card displayed in chat for booking ${deposit.bookingId}`);
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to display bank card in chat:', error);
    }
  }
  
  /**
   * Send notifications to dashboard and chat
   */
  private async sendNotification(notification: PaymentNotification): Promise<void> {
    try {
      // Send to dashboard notifications
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'notifications',
        ID.unique(),
        {
          recipientId: notification.recipientId,
          recipientType: notification.recipientType,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          urgent: notification.urgent,
          bookingId: notification.bookingId,
          read: false,
          createdAt: new Date().toISOString()
        }
      );
      
      // Send to chat if applicable
      if (notification.recipientType !== 'admin') {
        const { serverEnforcedChatService } = await import('./serverEnforcedChatService');
        
        const chatRoomId = notification.recipientType === 'customer' 
          ? `${notification.recipientId}_system`
          : `system_${notification.recipientId}`;
        
        await serverEnforcedChatService.sendMessage({
          conversationId: chatRoomId,
          senderId: 'system',
          senderName: 'IndaStreet Notifications',
          senderRole: 'admin',
          receiverId: notification.recipientId,
          receiverName: notification.recipientType.charAt(0).toUpperCase() + notification.recipientType.slice(1),
          receiverRole: notification.recipientType as any,
          message: `${notification.title}\n\n${notification.message}`,
          messageType: 'system'
        });
      }
      
      console.log(`🔔 [ScheduledPayment] Notification sent: ${notification.title}`);
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to send notification:', error);
    }
  }
  
  /**
   * Get scheduled bookings for dashboard
   */
  async getScheduledBookingsForDashboard(
    therapistId: string,
    status?: string[]
  ): Promise<ScheduledBookingDeposit[]> {
    try {
      const queries = [
        Query.equal('therapistId', therapistId),
        Query.orderDesc('createdAt')
      ];
      
      if (status && status.length > 0) {
        queries.push(Query.equal('depositStatus', status));
      }
      
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        queries
      );
      
      return result.documents as ScheduledBookingDeposit[];
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to get scheduled bookings:', error);
      return [];
    }
  }
  
  /**
   * Format price to IDR currency
   */
  private formatPrice(amount: number): string {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
  
  /**
   * Get upcoming bookings needing reminders
   */
  async getUpcomingBookingsForReminders(): Promise<ScheduledBookingDeposit[]> {
    try {
      const fiveHoursFromNow = new Date(Date.now() + (5 * 60 * 60 * 1000));
      const sixHoursFromNow = new Date(Date.now() + (6 * 60 * 60 * 1000));
      
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'scheduled_booking_deposits',
        [
          Query.equal('depositStatus', 'approved'),
          Query.lessThanEqual('scheduledDate', sixHoursFromNow.toISOString()),
          Query.greaterThanEqual('scheduledDate', fiveHoursFromNow.toISOString())
        ]
      );
      
      return result.documents.filter(doc => {
        const deposit = doc as ScheduledBookingDeposit;
        return !deposit.remindersSent.some(reminder => {
          const reminderDate = new Date(reminder);
          const now = new Date();
          return (now.getTime() - reminderDate.getTime()) < (60 * 60 * 1000); // No reminder in last hour
        });
      }) as ScheduledBookingDeposit[];
    } catch (error) {
      console.error('❌ [ScheduledPayment] Failed to get upcoming bookings for reminders:', error);
      return [];
    }
  }
}

export const scheduledBookingPaymentService = new ScheduledBookingPaymentService();
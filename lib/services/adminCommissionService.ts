/**
 * 🔒 ADMIN COMMISSION SERVICE
 * Automatic commission tracking with notification timeline
 * 
 * Rules:
 * - Admin commission = 30% of completed booking value
 * - Commission timer starts AFTER booking marked COMPLETED
 * - Payment deadline = 3 hours
 * 
 * Timeline (from booking completion):
 * - +2h00m → Reminder notification
 * - +2h30m → Urgent warning
 * - +3h00m → Final warning (30 minutes left)
 * - +3h30m → Enforce restriction (account blocked)
 * 
 * Commission Status:
 * - PENDING → Initial state after booking completion
 * - PAID → Payment proof verified by admin
 * - OVERDUE → Payment deadline exceeded, account restricted
 */

import { databases, ID, Query } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

// ============================================================================
// COMMISSION STATUS ENUM
// ============================================================================

export enum CommissionStatus {
  PENDING = 'PENDING',     // Awaiting payment (within deadline)
  PAID = 'PAID',           // Payment verified by admin
  OVERDUE = 'OVERDUE',     // Deadline exceeded, account restricted
}

// ============================================================================
// NOTIFICATION TYPE ENUM
// ============================================================================

export enum CommissionNotificationType {
  REMINDER = 'COMMISSION_REMINDER',           // +2h
  URGENT_WARNING = 'COMMISSION_URGENT',       // +2h30m
  FINAL_WARNING = 'COMMISSION_FINAL',         // +3h
  RESTRICTION_ENFORCED = 'COMMISSION_BLOCKED', // +3h30m
}

// ============================================================================
// COMMISSION RECORD INTERFACE
// ============================================================================

export interface AdminCommissionRecord {
  $id?: string;
  commissionId: string;
  bookingId: string;
  
  // Provider info
  therapistId: string;
  therapistName: string;
  
  // Amount details
  bookingAmount: number;
  commissionRate: number;     // 0.30 (30%)
  commissionAmount: number;   // 30% of bookingAmount
  
  // Reactivation fee (applied when OVERDUE)
  reactivationFeeRequired: boolean;   // True when status becomes OVERDUE
  reactivationFeeAmount: number;      // 25,000 IDR
  reactivationFeePaid: boolean;       // True when fee is paid
  totalAmountDue: number;             // commissionAmount + reactivationFeeAmount (if required)
  
  // Status tracking
  status: CommissionStatus;
  
  // Timestamps
  completedAt: string;        // When booking was marked COMPLETED
  paymentDeadline: string;    // +3 hours from completedAt
  reminderSentAt?: string;    // +2h notification
  urgentWarningSentAt?: string; // +2h30m notification
  finalWarningSentAt?: string;  // +3h notification
  restrictedAt?: string;      // +3h30m restriction enforced
  paidAt?: string;            // When payment was verified
  reactivatedAt?: string;     // When account was reactivated
  
  // Payment proof
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  verifiedBy?: string;
  
  // Admin override (if fee/commission waived)
  adminOverrideReason?: string;
  adminOverrideBy?: string;
  adminOverrideAt?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

const NOTIFICATION_TEMPLATES = {
  [CommissionNotificationType.REMINDER]: {
    title: '⏰ Commission Payment Reminder',
    message: (amount: number, timeLeft: string) => 
      `You have ${timeLeft} left to pay your commission of Rp ${amount.toLocaleString('id-ID')}. Please upload payment proof to avoid account restriction.`,
  },
  [CommissionNotificationType.URGENT_WARNING]: {
    title: '⚠️ URGENT: Commission Payment Due',
    message: (amount: number, timeLeft: string) => 
      `Only ${timeLeft} left! Pay your commission of Rp ${amount.toLocaleString('id-ID')} immediately or your account will be restricted.`,
  },
  [CommissionNotificationType.FINAL_WARNING]: {
    title: '🚨 FINAL WARNING: 30 Minutes Left',
    message: (amount: number) => 
      `You have only 30 MINUTES to pay your commission of Rp ${amount.toLocaleString('id-ID')}. Your account will be BLOCKED if not paid.`,
  },
  [CommissionNotificationType.RESTRICTION_ENFORCED]: {
    title: '🔒 Account Restricted - Payment Overdue',
    message: (amount: number) => 
      `Your account has been RESTRICTED due to unpaid commission of Rp ${amount.toLocaleString('id-ID')}. Upload payment proof to request reactivation.`,
  },
};

// ============================================================================
// TIME CONSTANTS (in milliseconds)
// ============================================================================

const COMMISSION_RATE = 0.30; // 30%
const PAYMENT_DEADLINE_MS = 3 * 60 * 60 * 1000;      // 3 hours
const REMINDER_TIME_MS = 2 * 60 * 60 * 1000;         // 2 hours
const URGENT_WARNING_TIME_MS = 2.5 * 60 * 60 * 1000; // 2 hours 30 min
const FINAL_WARNING_TIME_MS = 3 * 60 * 60 * 1000;    // 3 hours
const RESTRICTION_TIME_MS = 3.5 * 60 * 60 * 1000;    // 3 hours 30 min

// ============================================================================
// ADMIN REACTIVATION FEE
// ============================================================================

export const ADMIN_REACTIVATION_FEE = 25000; // Rp 25,000 IDR

// ============================================================================
// ADMIN COMMISSION SERVICE
// ============================================================================

export const adminCommissionService = {
  /**
   * Create commission record when booking is marked COMPLETED
   * Commission timer starts from this moment
   */
  async createCommissionOnCompletion(data: {
    bookingId: string;
    therapistId: string;
    therapistName: string;
    bookingAmount: number;
    completedAt?: string;
  }): Promise<AdminCommissionRecord> {
    const now = new Date();
    const completedAt = data.completedAt || now.toISOString();
    const completedTime = new Date(completedAt);
    
    // Calculate payment deadline (+3 hours from completion)
    const paymentDeadline = new Date(completedTime.getTime() + PAYMENT_DEADLINE_MS);
    
    // Calculate commission amount (30%)
    const commissionAmount = Math.round(data.bookingAmount * COMMISSION_RATE);
    const commissionId = `COM_${now.getTime()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const record: Omit<AdminCommissionRecord, '$id'> = {
      commissionId,
      bookingId: data.bookingId,
      therapistId: data.therapistId,
      therapistName: data.therapistName,
      bookingAmount: data.bookingAmount,
      commissionRate: COMMISSION_RATE,
      commissionAmount,
      // Reactivation fee - not required until OVERDUE
      reactivationFeeRequired: false,
      reactivationFeeAmount: 0,
      reactivationFeePaid: false,
      totalAmountDue: commissionAmount, // Just commission for now
      status: CommissionStatus.PENDING,
      completedAt,
      paymentDeadline: paymentDeadline.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      const result = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        ID.unique(),
        {
          ...record,
          // Flatten for Appwrite compatibility
          commissionRate: record.commissionRate,
          status: record.status,
        }
      );

      console.log(`✅ [AdminCommission] Created commission ${commissionId}`);
      console.log(`💰 Amount: Rp ${commissionAmount.toLocaleString('id-ID')} (30% of Rp ${data.bookingAmount.toLocaleString('id-ID')})`);
      console.log(`⏰ Payment deadline: ${paymentDeadline.toISOString()}`);
      console.log(`📅 Timeline:`);
      console.log(`   +2h00m: Reminder notification`);
      console.log(`   +2h30m: Urgent warning`);
      console.log(`   +3h00m: Final warning (30 min left)`);
      console.log(`   +3h30m: Account restriction enforced`);

      // Schedule notifications
      this.scheduleNotifications({ ...record, $id: result.$id });

      return { ...record, $id: result.$id };
    } catch (error) {
      console.error('❌ [AdminCommission] Failed to create commission record:', error);
      throw error;
    }
  },

  /**
   * Schedule all notification timers for a commission
   */
  scheduleNotifications(commission: AdminCommissionRecord): void {
    const completedAt = new Date(commission.completedAt).getTime();
    const now = Date.now();
    
    // Calculate delays from now
    const reminderDelay = (completedAt + REMINDER_TIME_MS) - now;
    const urgentDelay = (completedAt + URGENT_WARNING_TIME_MS) - now;
    const finalDelay = (completedAt + FINAL_WARNING_TIME_MS) - now;
    const restrictionDelay = (completedAt + RESTRICTION_TIME_MS) - now;

    console.log(`📅 [AdminCommission] Scheduling notifications for ${commission.commissionId}`);

    // +2h: Reminder notification
    if (reminderDelay > 0) {
      setTimeout(async () => {
        await this.sendReminderNotification(commission);
      }, reminderDelay);
      console.log(`   ⏰ Reminder in ${Math.round(reminderDelay / 60000)} minutes`);
    }

    // +2h30m: Urgent warning
    if (urgentDelay > 0) {
      setTimeout(async () => {
        await this.sendUrgentWarning(commission);
      }, urgentDelay);
      console.log(`   ⚠️ Urgent warning in ${Math.round(urgentDelay / 60000)} minutes`);
    }

    // +3h: Final warning
    if (finalDelay > 0) {
      setTimeout(async () => {
        await this.sendFinalWarning(commission);
      }, finalDelay);
      console.log(`   🚨 Final warning in ${Math.round(finalDelay / 60000)} minutes`);
    }

    // +3h30m: Enforce restriction
    if (restrictionDelay > 0) {
      setTimeout(async () => {
        await this.enforceRestriction(commission);
      }, restrictionDelay);
      console.log(`   🔒 Restriction in ${Math.round(restrictionDelay / 60000)} minutes`);
    }
  },

  /**
   * Send +2h reminder notification
   */
  async sendReminderNotification(commission: AdminCommissionRecord): Promise<void> {
    // Check if already paid
    const current = await this.getCommissionById(commission.$id!);
    if (!current || current.status !== CommissionStatus.PENDING) {
      console.log(`ℹ️ [AdminCommission] Skipping reminder - commission ${commission.commissionId} not pending`);
      return;
    }

    const template = NOTIFICATION_TEMPLATES[CommissionNotificationType.REMINDER];
    const timeLeft = '1 hour';

    await this.createNotification({
      therapistId: commission.therapistId,
      type: CommissionNotificationType.REMINDER,
      title: template.title,
      message: template.message(commission.commissionAmount, timeLeft),
      commissionId: commission.commissionId,
    });

    // Update record
    await this.updateCommission(commission.$id!, {
      reminderSentAt: new Date().toISOString(),
    });

    console.log(`📬 [AdminCommission] Sent reminder notification for ${commission.commissionId}`);
  },

  /**
   * Send +2h30m urgent warning
   */
  async sendUrgentWarning(commission: AdminCommissionRecord): Promise<void> {
    const current = await this.getCommissionById(commission.$id!);
    if (!current || current.status !== CommissionStatus.PENDING) {
      return;
    }

    const template = NOTIFICATION_TEMPLATES[CommissionNotificationType.URGENT_WARNING];
    const timeLeft = '30 minutes';

    await this.createNotification({
      therapistId: commission.therapistId,
      type: CommissionNotificationType.URGENT_WARNING,
      title: template.title,
      message: template.message(commission.commissionAmount, timeLeft),
      commissionId: commission.commissionId,
    });

    await this.updateCommission(commission.$id!, {
      urgentWarningSentAt: new Date().toISOString(),
    });

    console.log(`⚠️ [AdminCommission] Sent urgent warning for ${commission.commissionId}`);
  },

  /**
   * Send +3h final warning (30 minutes left)
   */
  async sendFinalWarning(commission: AdminCommissionRecord): Promise<void> {
    const current = await this.getCommissionById(commission.$id!);
    if (!current || current.status !== CommissionStatus.PENDING) {
      return;
    }

    const template = NOTIFICATION_TEMPLATES[CommissionNotificationType.FINAL_WARNING];

    await this.createNotification({
      therapistId: commission.therapistId,
      type: CommissionNotificationType.FINAL_WARNING,
      title: template.title,
      message: template.message(commission.commissionAmount),
      commissionId: commission.commissionId,
      urgent: true,
    });

    await this.updateCommission(commission.$id!, {
      finalWarningSentAt: new Date().toISOString(),
    });

    console.log(`🚨 [AdminCommission] Sent FINAL warning for ${commission.commissionId}`);
  },

  /**
   * Enforce restriction at +3h30m
   * Applies 25,000 IDR admin reactivation fee
   */
  async enforceRestriction(commission: AdminCommissionRecord): Promise<void> {
    const current = await this.getCommissionById(commission.$id!);
    if (!current || current.status !== CommissionStatus.PENDING) {
      return;
    }

    // Calculate total amount due (commission + reactivation fee)
    const totalAmountDue = commission.commissionAmount + ADMIN_REACTIVATION_FEE;

    // Update commission status to OVERDUE with reactivation fee
    await this.updateCommission(commission.$id!, {
      status: CommissionStatus.OVERDUE,
      restrictedAt: new Date().toISOString(),
      // Apply reactivation fee
      reactivationFeeRequired: true,
      reactivationFeeAmount: ADMIN_REACTIVATION_FEE,
      reactivationFeePaid: false,
      totalAmountDue: totalAmountDue,
    });

    // Restrict therapist account - blocks ALL bookings
    await this.restrictTherapistAccount(commission.therapistId, {
      commissionId: commission.commissionId,
      commissionAmount: commission.commissionAmount,
      reactivationFee: ADMIN_REACTIVATION_FEE,
      totalAmountDue: totalAmountDue,
    });

    // Send restriction notification with total amount due
    const template = NOTIFICATION_TEMPLATES[CommissionNotificationType.RESTRICTION_ENFORCED];
    await this.createNotification({
      therapistId: commission.therapistId,
      type: CommissionNotificationType.RESTRICTION_ENFORCED,
      title: template.title,
      message: `Your account has been RESTRICTED due to unpaid commission of Rp ${commission.commissionAmount.toLocaleString('id-ID')}. ` +
               `A reactivation fee of Rp ${ADMIN_REACTIVATION_FEE.toLocaleString('id-ID')} has been applied. ` +
               `Total amount due: Rp ${totalAmountDue.toLocaleString('id-ID')}. ` +
               `Upload payment proof to request reactivation.`,
      commissionId: commission.commissionId,
      urgent: true,
    });

    console.log(`🔒 [AdminCommission] RESTRICTION ENFORCED for ${commission.therapistId}`);
    console.log(`   Commission: ${commission.commissionId}`);
    console.log(`   Commission Amount: Rp ${commission.commissionAmount.toLocaleString('id-ID')}`);
    console.log(`   Reactivation Fee: Rp ${ADMIN_REACTIVATION_FEE.toLocaleString('id-ID')}`);
    console.log(`   TOTAL DUE: Rp ${totalAmountDue.toLocaleString('id-ID')}`);
  },

  /**
   * Request reactivation - requires FULL payment (commission + fee)
   * Therapist initiates this after uploading payment proof
   */
  async requestReactivation(
    commissionId: string,
    paymentProofUrl: string
  ): Promise<{ success: boolean; message: string; totalDue?: number }> {
    try {
      const commission = await this.getCommissionById(commissionId);
      if (!commission) {
        return { success: false, message: 'Commission record not found' };
      }

      if (commission.status !== CommissionStatus.OVERDUE) {
        return { success: false, message: 'Account is not restricted' };
      }

      const totalDue = commission.totalAmountDue || 
        (commission.commissionAmount + (commission.reactivationFeeRequired ? ADMIN_REACTIVATION_FEE : 0));

      // Update with payment proof - awaiting admin verification
      await this.updateCommission(commissionId, {
        paymentProofUrl,
        paymentProofUploadedAt: new Date().toISOString(),
      });

      // Notify admin of reactivation request
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        ID.unique(),
        {
          recipientId: 'admin',
          recipientType: 'admin',
          type: 'REACTIVATION_REQUEST',
          title: '🔓 Reactivation Request',
          message: `Therapist ${commission.therapistName} has uploaded payment proof of Rp ${totalDue.toLocaleString('id-ID')} for reactivation.`,
          commissionId: commission.commissionId,
          urgent: true,
          read: false,
          createdAt: new Date().toISOString(),
        }
      );

      console.log(`📤 [AdminCommission] Reactivation requested for ${commission.commissionId}`);
      console.log(`   Payment proof: ${paymentProofUrl}`);
      console.log(`   Total amount: Rp ${totalDue.toLocaleString('id-ID')}`);

      return {
        success: true,
        message: `Reactivation request submitted. Admin will verify your payment of Rp ${totalDue.toLocaleString('id-ID')}.`,
        totalDue,
      };
    } catch (error) {
      console.error('Error requesting reactivation:', error);
      return { success: false, message: 'Failed to submit reactivation request' };
    }
  },

  /**
   * Verify reactivation payment and unrestrict account (ADMIN ONLY)
   * Must verify both commission AND reactivation fee
   */
  async verifyReactivationPayment(
    commissionId: string,
    verifiedBy: string
  ): Promise<AdminCommissionRecord | null> {
    try {
      const commission = await this.getCommissionById(commissionId);
      if (!commission) {
        throw new Error(`Commission ${commissionId} not found`);
      }

      if (commission.status !== CommissionStatus.OVERDUE) {
        throw new Error('Commission is not in OVERDUE status');
      }

      if (!commission.paymentProofUrl) {
        throw new Error('No payment proof uploaded');
      }

      const now = new Date().toISOString();

      // Mark both commission and reactivation fee as paid
      const result = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        commissionId,
        {
          status: CommissionStatus.PAID,
          paidAt: now,
          verifiedBy,
          reactivationFeePaid: true,
          reactivatedAt: now,
          updatedAt: now,
        }
      );

      // Unrestrict the account
      await this.unrestrictTherapistAccount(commission.therapistId);

      // Notify therapist
      await this.createNotification({
        therapistId: commission.therapistId,
        type: CommissionNotificationType.REMINDER, // Re-using type
        title: '✅ Account Reactivated',
        message: `Your payment of Rp ${commission.totalAmountDue.toLocaleString('id-ID')} has been verified. Your account is now active and you can accept bookings again.`,
        commissionId: commission.commissionId,
      });

      console.log(`✅ [AdminCommission] Reactivation verified for ${commission.therapistId}`);
      console.log(`   Commission: Rp ${commission.commissionAmount.toLocaleString('id-ID')} - PAID`);
      console.log(`   Reactivation Fee: Rp ${ADMIN_REACTIVATION_FEE.toLocaleString('id-ID')} - PAID`);
      console.log(`   Verified by: ${verifiedBy}`);

      return result as unknown as AdminCommissionRecord;
    } catch (error) {
      console.error('❌ [AdminCommission] Failed to verify reactivation:', error);
      return null;
    }
  },

  /**
   * Admin override - reactivate without payment (ADMIN ONLY)
   * Only accessible from admin dashboard
   */
  async adminOverrideReactivation(
    commissionId: string,
    adminId: string,
    reason: string
  ): Promise<AdminCommissionRecord | null> {
    try {
      const commission = await this.getCommissionById(commissionId);
      if (!commission) {
        throw new Error(`Commission ${commissionId} not found`);
      }

      const now = new Date().toISOString();

      // Mark as paid with admin override note
      const result = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        commissionId,
        {
          status: CommissionStatus.PAID,
          paidAt: now,
          verifiedBy: `ADMIN_OVERRIDE:${adminId}`,
          reactivationFeePaid: true,
          reactivatedAt: now,
          updatedAt: now,
          // Store override reason
          adminOverrideReason: reason,
          adminOverrideBy: adminId,
          adminOverrideAt: now,
        }
      );

      // Unrestrict the account
      await this.unrestrictTherapistAccount(commission.therapistId);

      console.log(`⚠️ [AdminCommission] ADMIN OVERRIDE reactivation for ${commission.therapistId}`);
      console.log(`   Admin: ${adminId}`);
      console.log(`   Reason: ${reason}`);
      console.log(`   Commission waived: Rp ${commission.commissionAmount.toLocaleString('id-ID')}`);
      console.log(`   Fee waived: Rp ${ADMIN_REACTIVATION_FEE.toLocaleString('id-ID')}`);

      return result as unknown as AdminCommissionRecord;
    } catch (error) {
      console.error('❌ [AdminCommission] Failed admin override:', error);
      return null;
    }
  },

  /**
   * Get reactivation summary for a therapist
   */
  async getReactivationSummary(therapistId: string): Promise<{
    isRestricted: boolean;
    commissionAmount: number;
    reactivationFee: number;
    totalDue: number;
    commissionId?: string;
    paymentProofUploaded: boolean;
  } | null> {
    try {
      const overdueCommissions = await this.getOverdueCommissions(therapistId);
      if (overdueCommissions.length === 0) {
        return {
          isRestricted: false,
          commissionAmount: 0,
          reactivationFee: 0,
          totalDue: 0,
          paymentProofUploaded: false,
        };
      }

      // Get the most recent overdue commission
      const commission = overdueCommissions[0];
      const reactivationFee = commission.reactivationFeeRequired ? ADMIN_REACTIVATION_FEE : 0;
      const totalDue = commission.commissionAmount + reactivationFee;

      return {
        isRestricted: true,
        commissionAmount: commission.commissionAmount,
        reactivationFee,
        totalDue,
        commissionId: commission.$id,
        paymentProofUploaded: !!commission.paymentProofUrl,
      };
    } catch (error) {
      console.error('Error getting reactivation summary:', error);
      return null;
    }
  },

  /**
   * Mark commission as PAID (admin verification)
   * For regular payments (before OVERDUE), just marks commission paid
   */
  async markAsPaid(commissionId: string, verifiedBy: string): Promise<AdminCommissionRecord | null> {
    try {
      const commission = await this.getCommissionById(commissionId);
      if (!commission) {
        throw new Error(`Commission ${commissionId} not found`);
      }

      const result = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        commissionId,
        {
          status: CommissionStatus.PAID,
          paidAt: new Date().toISOString(),
          verifiedBy,
          updatedAt: new Date().toISOString(),
        }
      );

      // If was restricted, unrestrict account
      if (commission.status === CommissionStatus.OVERDUE) {
        await this.unrestrictTherapistAccount(commission.therapistId);
      }

      console.log(`✅ [AdminCommission] Commission ${commissionId} marked as PAID`);
      return result as unknown as AdminCommissionRecord;
    } catch (error) {
      console.error('❌ [AdminCommission] Failed to mark as paid:', error);
      return null;
    }
  },

  /**
   * Get commission by document ID
   */
  async getCommissionById(documentId: string): Promise<AdminCommissionRecord | null> {
    try {
      const result = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        documentId
      );
      return result as unknown as AdminCommissionRecord;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get pending commissions for therapist
   */
  async getPendingCommissions(therapistId: string): Promise<AdminCommissionRecord[]> {
    try {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        [
          Query.equal('therapistId', therapistId),
          Query.equal('status', CommissionStatus.PENDING),
        ]
      );
      return result.documents as unknown as AdminCommissionRecord[];
    } catch (error) {
      console.error('Error fetching pending commissions:', error);
      return [];
    }
  },

  /**
   * Get overdue commissions for therapist
   */
  async getOverdueCommissions(therapistId: string): Promise<AdminCommissionRecord[]> {
    try {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        [
          Query.equal('therapistId', therapistId),
          Query.equal('status', CommissionStatus.OVERDUE),
        ]
      );
      return result.documents as unknown as AdminCommissionRecord[];
    } catch (error) {
      console.error('Error fetching overdue commissions:', error);
      return [];
    }
  },

  /**
   * Check if therapist has any unpaid/overdue commissions
   */
  async hasUnpaidCommissions(therapistId: string): Promise<boolean> {
    const pending = await this.getPendingCommissions(therapistId);
    const overdue = await this.getOverdueCommissions(therapistId);
    return pending.length > 0 || overdue.length > 0;
  },

  /**
   * Get total unpaid commission amount
   */
  async getTotalUnpaidAmount(therapistId: string): Promise<number> {
    const pending = await this.getPendingCommissions(therapistId);
    const overdue = await this.getOverdueCommissions(therapistId);
    const all = [...pending, ...overdue];
    return all.reduce((sum, c) => sum + c.commissionAmount, 0);
  },

  /**
   * Update commission record
   */
  async updateCommission(documentId: string, updates: Partial<AdminCommissionRecord>): Promise<void> {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        documentId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error updating commission:', error);
    }
  },

  /**
   * Create notification for therapist
   */
  async createNotification(data: {
    therapistId: string;
    type: CommissionNotificationType;
    title: string;
    message: string;
    commissionId: string;
    urgent?: boolean;
  }): Promise<void> {
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        ID.unique(),
        {
          recipientId: data.therapistId,
          recipientType: 'therapist',
          type: data.type,
          title: data.title,
          message: data.message,
          commissionId: data.commissionId,
          urgent: data.urgent || false,
          read: false,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  },

  /**
   * Restrict therapist account (OVERDUE status)
   * Blocks ALL bookings (Book Now AND Scheduled)
   */
  async restrictTherapistAccount(
    therapistId: string,
    feeInfo?: {
      commissionId: string;
      commissionAmount: number;
      reactivationFee: number;
      totalAmountDue: number;
    }
  ): Promise<void> {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.therapists || 'therapists',
        therapistId,
        {
          status: 'RESTRICTED',
          bookingEnabled: false,
          scheduleEnabled: false,
          restrictionReason: feeInfo 
            ? `Commission payment overdue. Total due: Rp ${feeInfo.totalAmountDue.toLocaleString('id-ID')} (Commission: Rp ${feeInfo.commissionAmount.toLocaleString('id-ID')} + Reactivation Fee: Rp ${feeInfo.reactivationFee.toLocaleString('id-ID')})`
            : 'Commission payment overdue',
          restrictedAt: new Date().toISOString(),
          // Store fee details for reference
          pendingCommissionId: feeInfo?.commissionId || null,
          pendingCommissionAmount: feeInfo?.commissionAmount || 0,
          pendingReactivationFee: feeInfo?.reactivationFee || 0,
          totalAmountDue: feeInfo?.totalAmountDue || 0,
          updatedAt: new Date().toISOString(),
        }
      );
      console.log(`🔒 [AdminCommission] Account RESTRICTED: ${therapistId}`);
      if (feeInfo) {
        console.log(`   Total Amount Due: Rp ${feeInfo.totalAmountDue.toLocaleString('id-ID')}`);
      }
    } catch (error) {
      console.error('Error restricting account:', error);
    }
  },

  /**
   * Unrestrict therapist account (after FULL payment verified)
   * Requires both commission AND reactivation fee to be paid
   */
  async unrestrictTherapistAccount(therapistId: string): Promise<void> {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.therapists || 'therapists',
        therapistId,
        {
          status: 'AVAILABLE',
          bookingEnabled: true,
          scheduleEnabled: true,
          restrictionReason: null,
          restrictedAt: null,
          // Clear fee tracking
          pendingCommissionId: null,
          pendingCommissionAmount: 0,
          pendingReactivationFee: 0,
          totalAmountDue: 0,
          updatedAt: new Date().toISOString(),
        }
      );
      console.log(`✅ [AdminCommission] Account UNRESTRICTED: ${therapistId}`);
    } catch (error) {
      console.error('Error unrestricting account:', error);
    }
  },

  /**
   * Process all overdue commissions (called by server cron)
   */
  async processOverdueCommissions(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Find all pending commissions past restriction time (+3h30m)
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        [
          Query.equal('status', CommissionStatus.PENDING),
        ]
      );

      for (const doc of result.documents) {
        const commission = doc as unknown as AdminCommissionRecord;
        const completedAt = new Date(commission.completedAt).getTime();
        const restrictionTime = completedAt + RESTRICTION_TIME_MS;
        
        if (Date.now() >= restrictionTime) {
          await this.enforceRestriction(commission);
        }
      }
    } catch (error) {
      console.error('Error processing overdue commissions:', error);
    }
  },
};

export default adminCommissionService;

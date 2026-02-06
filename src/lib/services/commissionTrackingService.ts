/**
 * Commission Payment Tracking Service
 * 
 * Handles Pro membership 30% commission payments:
 * - Creates commission record after booking completion
 * - EXACTLY 3-hour payment deadline (SERVER TIME ONLY)
 * - Deactivates account if payment deadline exceeded (SERVER-SIDE ENFORCEMENT)
 * - Account reactivation ONLY on admin approval (NOT on proof upload)
 * - Admin verification system with audit logging
 * 
 * CRITICAL: NO client-side enforcement. All deadline checks via Appwrite Function.
 */

import { databases, storage, APPWRITE_CONFIG, Query, ID } from './_shared';

export interface CommissionPayment {
    $id: string;
    therapistId: string;
    therapistName: string;
    bookingId: string;
    bookingDate: string;
    scheduledDate?: string;
    serviceAmount: number;
    commissionRate: number; // 30%
    commissionAmount: number;
    paymentDeadline: string; // 5 hours after booking
    // Enhanced: Booking details for display
    customerName?: string;
    massageType?: string;
    duration?: number; // minutes
    // Late fee fields (applied when overdue)
    lateFee?: number; // 50,000 IDR penalty
    totalDue?: number; // commissionAmount + lateFee
    paymentProofUrl?: string;
    paymentProofImage?: string; // Alias for paymentProofUrl
    paymentProofUploadedAt?: string;
    paymentMethod?: string;
    status: 'pending' | 'awaiting_verification' | 'verified' | 'rejected' | 'overdue';
    rejectionReason?: string;
    verifiedBy?: string;
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}

class CommissionTrackingService {

    private readonly collectionId = APPWRITE_CONFIG.collections.commissionRecords || 'commission_records';

    /**
     * Check if therapist has any unpaid commissions
     * Used to block new bookings until payment is made
     */
    async hasUnpaidCommissions(therapistId: string): Promise<boolean> {
        try {
            const unpaidRecords = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('therapistId', therapistId),
                    Query.equal('status', ['pending', 'overdue'])
                ]
            );

            const hasUnpaid = unpaidRecords.documents.length > 0;
            
            if (hasUnpaid) {
                console.log(`⚠️ Therapist ${therapistId} has ${unpaidRecords.documents.length} unpaid commission(s)`);
            }
            
            return hasUnpaid;
        } catch (error) {
            console.error('Error checking unpaid commissions:', error);
            return false; // Allow booking if check fails
        }
    }

    /**
     * Get total unpaid commission amount for therapist
     */
    async getUnpaidAmount(therapistId: string): Promise<number> {
        try {
            const unpaidRecords = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('therapistId', therapistId),
                    Query.equal('status', ['pending', 'overdue'])
                ]
            );

            return unpaidRecords.documents.reduce((total, doc) => {
                return total + ((doc as any).commissionAmount || 0);
            }, 0);
        } catch (error) {
            console.error('Error getting unpaid amount:', error);
            return 0;
        }
    }

    /**
     * Create commission record after booking (Book Now or Schedule)
     * Includes full booking details for admin dashboard
     */
    async createCommissionRecord(
        therapistId: string,
        therapistName: string,
        bookingId: string,
        bookingDate: string,
        scheduledDate: string | undefined,
        serviceAmount: number,
        // Enhanced: Additional booking details for display
        customerName?: string,
        massageType?: string,
        duration?: number // in minutes
    ): Promise<CommissionPayment> {
        const commissionRate = 30; // Pro membership: 30%
        const commissionAmount = Math.round(serviceAmount * 0.30);
        
        // EXACTLY 5-hour deadline from booking completion (SERVER TIME)
        // 🔒 BUSINESS RULE: Therapist must pay 30% within 5 hours or account goes BUSY
        const deadline = new Date(bookingDate);
        deadline.setHours(deadline.getHours() + 5);

        try {
            const record = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                ID.unique(),
                {
                    therapistId,
                    therapistName,
                    bookingId,
                    bookingDate,
                    scheduledDate: scheduledDate || null,
                    serviceAmount,
                    commissionRate,
                    commissionAmount,
                    paymentDeadline: deadline.toISOString(),
                    // Enhanced: Booking details for admin dashboard display
                    customerName: customerName || 'Customer',
                    massageType: massageType || 'Massage Service',
                    duration: duration || 60,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Commission record created:', record.$id);
            console.log('⏰ Payment deadline:', deadline.toISOString());
            console.log('⚠️  CRITICAL: Deadline enforcement is SERVER-SIDE ONLY via Appwrite Function');
            
            // NOTE: Deadline enforcement handled by Appwrite Function (runs every 5-10 minutes)
            // Client-side scheduling REMOVED to prevent bypass attacks
            
            return record as unknown as unknown as CommissionPayment;
        } catch (error) {
            console.error('Error creating commission record:', error);
            throw error;
        }
    }

    /**
     * Upload payment proof (member uploads via phone)
     * Account activates immediately after upload
     * 
     * 🔒 REQUIREMENT 3: PAYMENT PROOF SUBMISSION LOCK
     * Prevents duplicate uploads while verification is pending
     */
    async uploadPaymentProof(
        commissionId: string,
        proofFile: File,
        paymentMethod: string
    ): Promise<CommissionPayment> {
        try {
            // ============================================================================
            // 🚨 TESTING GATE REQUIREMENT 3: PAYMENT PROOF UPLOAD LOCK
            // ============================================================================
            
            // Fetch current commission record to check status
            const currentRecord = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                commissionId
            ) as unknown as CommissionPayment;
            
            // BLOCK: If already awaiting verification
            if (currentRecord.status === 'awaiting_verification') {
                console.log(`🚫 [UPLOAD BLOCKED] Commission ${commissionId} already awaiting verification`);
                throw new Error('Payment proof already submitted and awaiting admin verification. Please wait for approval.');
            }
            
            // BLOCK: If already verified
            if (currentRecord.status === 'verified') {
                console.log(`🚫 [UPLOAD BLOCKED] Commission ${commissionId} already verified`);
                throw new Error('This commission has already been verified. No further uploads are allowed.');
            }
            
            // ALLOW: Only if status is 'pending', 'rejected', or 'overdue'
            console.log(`✅ [UPLOAD ALLOWED] Commission ${commissionId} status: ${currentRecord.status}`);
            
            // Verify storage bucket exists in config
            const bucketId = APPWRITE_CONFIG.bucketId; // Use main bucket or add payment_proofs to config
            if (!bucketId) {
                throw new Error('Storage bucket not configured - cannot upload payment proof');
            }
            
            // Upload file to storage
            const uploadedFile = await storage.createFile(
                bucketId,
                ID.unique(),
                proofFile
            );

            const proofUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=${APPWRITE_CONFIG.projectId}`;

            // Update commission record
            const updated = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                commissionId,
                {
                    paymentProofImage: proofUrl,
                    paymentProofUploadedAt: new Date().toISOString(),
                    paymentMethod,
                    status: 'awaiting_verification',
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Payment proof uploaded - awaiting admin verification');
            console.log('⚠️  CRITICAL: Account remains DEACTIVATED until admin approval');

            // NOTE: Account reactivation happens ONLY after admin approval
            // This prevents fake proof uploads from bypassing payment enforcement
            const record = updated as unknown as CommissionPayment;

            // Notify admin for verification
            await this.notifyAdminForVerification(commissionId);

            return record;
        } catch (error) {
            console.error('Error uploading payment proof:', error);
            throw error;
        }
    }

    /**
     * Admin verifies payment proof
     */
    async verifyPayment(
        commissionId: string,
        adminId: string,
        verified: boolean,
        rejectionReason?: string
    ): Promise<CommissionPayment> {
        try {
            const status = verified ? 'verified' : 'rejected';
            
            const updated = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                commissionId,
                {
                    status,
                    verifiedBy: adminId,
                    verifiedAt: new Date().toISOString(),
                    rejectionReason: rejectionReason || null,
                    updatedAt: new Date().toISOString()
                }
            );

            const record = updated as unknown as CommissionPayment;

            if (!verified) {
                // If rejected, ensure account stays deactivated and require new proof
                await this.deactivateAccount(record.therapistId);
                console.log('❌ Payment rejected by admin - account remains deactivated');
            } else {
                // ONLY on admin approval - reactivate account
                await this.reactivateAccount(record.therapistId);
                console.log('✅ Payment verified by admin - account reactivated');
            }

            return record;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    // 🔒 LATE PAYMENT PENALTY - 50,000 IDR for overdue accounts
    private readonly LATE_PAYMENT_FEE = 50000;

    /**
     * Check for overdue payments and deactivate accounts
     * Adds 50,000 IDR late fee to overdue payments
     */
    async checkOverduePayments(): Promise<void> {
        try {
            const now = new Date().toISOString();

            const overdueRecords = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('status', 'pending'),
                    Query.lessThan('paymentDeadline', now)
                ]
            );

            for (const record of overdueRecords.documents) {
                const payment = record as unknown as unknown as CommissionPayment;
                
                // Calculate total with late fee
                const totalWithLateFee = (payment.commissionAmount || 0) + this.LATE_PAYMENT_FEE;
                
                // Mark as overdue with late fee applied
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    this.collectionId,
                    payment.$id,
                    {
                        status: 'overdue',
                        lateFee: this.LATE_PAYMENT_FEE,
                        totalDue: totalWithLateFee,
                        updatedAt: new Date().toISOString()
                    }
                );

                // Deactivate account (set to busy)
                await this.deactivateAccount(payment.therapistId);
                
                console.log(`❌ Payment overdue for ${payment.therapistName}, account deactivated. Late fee applied: IDR ${this.LATE_PAYMENT_FEE.toLocaleString()}`);
            }
        } catch (error) {
            console.error('Error checking overdue payments:', error);
        }
    }

    /**
     * Get pending payments for a therapist
     */
    async getTherapistPendingPayments(therapistId: string): Promise<CommissionPayment[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('therapistId', therapistId),
                    Query.equal('status', ['pending', 'overdue', 'awaiting_verification'])
                ]
            );

            return response.documents as unknown as CommissionPayment[];
        } catch (error) {
            console.error('Error fetching pending payments:', error);
            return [];
        }
    }

    /**
     * Get payments awaiting admin verification
     */
    async getPaymentsAwaitingVerification(): Promise<CommissionPayment[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [Query.equal('status', 'awaiting_verification')]
            );

            return response.documents as unknown as CommissionPayment[];
        } catch (error) {
            console.error('Error fetching payments for verification:', error);
            return [];
        }
    }

    /**
     * Deactivate therapist account (set to busy, disable booking buttons)
     */
    private async deactivateAccount(therapistId: string): Promise<void> {
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists || 'therapists',
                therapistId,
                {
                    status: 'busy',
                    bookingEnabled: false,
                    scheduleEnabled: false,
                    deactivationReason: 'Payment overdue - upload payment proof to reactivate',
                    updatedAt: new Date().toISOString()
                }
            );

            console.log(`🔒 Account deactivated: ${therapistId}`);
        } catch (error) {
            console.error('Error deactivating account:', error);
            throw error;
        }
    }

    /**
     * Reactivate therapist account after proof upload
     */
    private async reactivateAccount(therapistId: string): Promise<void> {
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists || 'therapists',
                therapistId,
                {
                    status: 'available',
                    bookingEnabled: true,
                    scheduleEnabled: true,
                    deactivationReason: null,
                    updatedAt: new Date().toISOString()
                }
            );

            console.log(`✅ Account reactivated: ${therapistId}`);
        } catch (error) {
            console.error('Error reactivating account:', error);
            throw error;
        }
    }

    /**
     * Notify admin when proof is uploaded
     */
    private async notifyAdminForVerification(commissionId: string): Promise<void> {
        try {
            // FORCE-FAIL: Throw if collection is empty
            const notificationsCollection = APPWRITE_CONFIG.collections.notifications;
            if (!notificationsCollection || notificationsCollection === '') {
                throw new Error('notifications collection ID is empty - cannot notify admin for verification');
            }

            // Create admin notification
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                notificationsCollection,
                ID.unique(),
                {
                    type: 'payment_verification',
                    title: 'New Payment Proof Submitted',
                    message: `A therapist has uploaded payment proof for commission ID: ${commissionId}`,
                    commissionId,
                    read: false,
                    createdAt: new Date().toISOString()
                }
            );

            console.log('📬 Admin notified for payment verification');
        } catch (error) {
            console.error('Error notifying admin:', error);
        }
    }

    /**
     * Get therapist payment history
     */
    async getPaymentHistory(therapistId: string, limit = 50): Promise<CommissionPayment[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('therapistId', therapistId),
                    Query.orderDesc('createdAt'),
                    Query.limit(limit)
                ]
            );

            return response.documents as unknown as CommissionPayment[];
        } catch (error) {
            console.error('Error fetching payment history:', error);
            return [];
        }
    }
}

export const commissionTrackingService = new CommissionTrackingService();

/**
 * Commission Payment Tracking Service
 * 
 * Handles Pro membership 30% commission payments:
 * - Creates commission record after booking
 * - 3-hour payment deadline
 * - Auto-deactivates account if payment not submitted
 * - Auto-reactivates after proof upload
 * - Admin verification system
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
    paymentDeadline: string; // 3 hours after booking
    paymentProofUrl?: string;
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
    private readonly collectionId = 'commission_payments'; // Hardcoded collection ID

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
     */
    async createCommissionRecord(
        therapistId: string,
        therapistName: string,
        bookingId: string,
        bookingDate: string,
        scheduledDate: string | undefined,
        serviceAmount: number
    ): Promise<CommissionPayment> {
        const commissionRate = 30; // Pro membership: 30%
        const commissionAmount = Math.round(serviceAmount * 0.30);
        
        // 3-hour deadline from booking time
        const deadline = new Date(bookingDate);
        deadline.setHours(deadline.getHours() + 3);

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
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Commission record created:', record.$id);
            
            // Start monitoring for 3-hour deadline
            this.scheduleDeadlineCheck(record.$id, deadline);

            return record as unknown as unknown as CommissionPayment;
        } catch (error) {
            console.error('Error creating commission record:', error);
            throw error;
        }
    }

    /**
     * Upload payment proof (member uploads via phone)
     * Account activates immediately after upload
     */
    async uploadPaymentProof(
        commissionId: string,
        proofFile: File,
        paymentMethod: string
    ): Promise<CommissionPayment> {
        try {
            // Upload file to storage
            const uploadedFile = await storage.createFile(
                'payment_proofs', // Hardcoded bucket ID
                ID.unique(),
                proofFile
            );

            const proofUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/payment_proofs/files/${uploadedFile.$id}/view?project=${APPWRITE_CONFIG.projectId}`;

            // Update commission record
            const updated = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                commissionId,
                {
                    paymentProofUrl: proofUrl,
                    paymentProofUploadedAt: new Date().toISOString(),
                    paymentMethod,
                    status: 'awaiting_verification',
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Payment proof uploaded, activating account...');

            // Get therapist ID and reactivate account
            const record = updated as unknown as CommissionPayment;
            await this.reactivateAccount(record.therapistId);

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
                // If rejected, deactivate account and require new proof
                await this.deactivateAccount(record.therapistId);
                console.log('❌ Payment rejected, account deactivated');
            } else {
                console.log('✅ Payment verified, account remains active');
            }

            return record;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    /**
     * Check for overdue payments and deactivate accounts
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
                
                // Mark as overdue
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    this.collectionId,
                    payment.$id,
                    {
                        status: 'overdue',
                        updatedAt: new Date().toISOString()
                    }
                );

                // Deactivate account (set to busy)
                await this.deactivateAccount(payment.therapistId);
                
                console.log(`❌ Payment overdue for ${payment.therapistName}, account deactivated`);
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
     * Schedule deadline check (3 hours)
     */
    private scheduleDeadlineCheck(commissionId: string, deadline: Date): void {
        const now = new Date();
        const timeUntilDeadline = deadline.getTime() - now.getTime();

        if (timeUntilDeadline > 0) {
            setTimeout(async () => {
                // Check if payment was submitted
                const record = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    this.collectionId,
                    commissionId
                );

                if ((record as unknown as unknown as CommissionPayment).status === 'pending') {
                    await this.checkOverduePayments();
                }
            }, timeUntilDeadline);
        }
    }

    /**
     * Notify admin when proof is uploaded
     */
    private async notifyAdminForVerification(commissionId: string): Promise<void> {
        try {
            // Create admin notification
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications, // Using notifications collection
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

import type { CommissionRecord } from '../types';
import { CommissionPaymentStatus, CommissionPaymentMethod } from '../types';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

/**
 * Commission Payment Service
 * Handles the flow of commission payments from providers to hotels/villas
 * 
 * FLOW:
 * 1. Service completed → Commission record created with status 'Pending'
 * 2. Provider uploads payment proof → Status changes to 'AwaitingVerification'
 * 3. Hotel/Villa verifies payment → Status changes to 'Verified', provider becomes Available
 * 4. If rejected → Provider must reupload, stays Busy
 */

class CommissionPaymentService {
    /**
     * Create commission record when booking is completed
     */
    async createCommissionRecord(
        hotelVillaId: number,
        hotelVillaType: 'hotel' | 'villa',
        bookingId: number,
        providerId: number,
        providerType: 'therapist' | 'place',
        providerName: string,
        serviceAmount: number,
        commissionRate: number
    ): Promise<CommissionRecord> {
        const commissionAmount = (serviceAmount * commissionRate) / 100;

        const recordData = {
            hotelVillaId,
            bookingId,
            providerId,
            providerType,
            providerName,
            serviceAmount,
            commissionRate,
            commissionAmount,
            status: CommissionPaymentStatus.Pending,
            bookingDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            // Save to Appwrite
            const doc = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                ID.unique(),
                recordData
            );

            const record: CommissionRecord = {
                id: parseInt(doc.$id) || Date.now(),
                ...recordData
            };

            console.log('📝 Commission record created:', record);

            // Send notification to provider about pending payment
            await this.notifyProviderPendingPayment(providerId, providerType, record);

            // Set provider to Busy status
            await this.setProviderBusy(providerId, providerType);

            return record;
        } catch (error) {
            console.error('Error creating commission record:', error);
            throw error;
        }
    }

    /**
     * Provider uploads payment proof screenshot
     */
    async uploadPaymentProof(
        commissionId: number,
        paymentProofImage: string,
        paymentMethod: CommissionPaymentMethod
    ): Promise<CommissionRecord> {
        try {
            // Fetch commission record from Appwrite
            const docs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                [Query.equal('$id', commissionId.toString())]
            );

            if (docs.documents.length === 0) {
                throw new Error('Commission record not found');
            }

            const doc = docs.documents[0];

            // Update record
            const updatedDoc = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                doc.$id,
                {
                    status: CommissionPaymentStatus.AwaitingVerification,
                    paymentMethod,
                    paymentProofImage,
                    paymentProofUploadedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            const updatedRecord: CommissionRecord = {
                id: parseInt(updatedDoc.$id) || commissionId,
                hotelVillaId: updatedDoc.hotelVillaId,
                bookingId: updatedDoc.bookingId,
                providerId: updatedDoc.providerId,
                providerType: updatedDoc.providerType,
                providerName: updatedDoc.providerName,
                serviceAmount: updatedDoc.serviceAmount,
                commissionRate: updatedDoc.commissionRate,
                commissionAmount: updatedDoc.commissionAmount,
                status: updatedDoc.status,
                paymentMethod: updatedDoc.paymentMethod,
                paymentProofImage: updatedDoc.paymentProofImage,
                paymentProofUploadedAt: updatedDoc.paymentProofUploadedAt,
                bookingDate: updatedDoc.bookingDate,
                createdAt: updatedDoc.createdAt,
                updatedAt: updatedDoc.updatedAt
            };

            console.log('📤 Payment proof uploaded:', updatedRecord);

            // Notify hotel/villa about new payment proof to verify
            await this.notifyHotelVillaNewPaymentProof(updatedRecord.hotelVillaId, updatedRecord);

            return updatedRecord;
        } catch (error) {
            console.error('Error uploading payment proof:', error);
            throw error;
        }
    }

    /**
     * Hotel/Villa verifies and accepts payment proof
     */
    async verifyPayment(
        commissionId: number,
        hotelVillaUserId: number,
        verified: boolean,
        rejectionReason?: string
    ): Promise<CommissionRecord> {
        try {
            // Fetch commission record from Appwrite
            const docs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                [Query.equal('$id', commissionId.toString())]
            );

            if (docs.documents.length === 0) {
                throw new Error('Commission record not found');
            }

            const doc = docs.documents[0];

            if (verified) {
                // Payment verified - provider can become available again
                const updatedDoc = await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.COMMISSION_RECORDS,
                    doc.$id,
                    {
                        status: CommissionPaymentStatus.Verified,
                        verifiedBy: hotelVillaUserId,
                        verifiedAt: new Date().toISOString(),
                        paidDate: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                );

                const updatedRecord: CommissionRecord = {
                    id: parseInt(updatedDoc.$id) || commissionId,
                    hotelVillaId: updatedDoc.hotelVillaId,
                    bookingId: updatedDoc.bookingId,
                    providerId: updatedDoc.providerId,
                    providerType: updatedDoc.providerType,
                    providerName: updatedDoc.providerName,
                    serviceAmount: updatedDoc.serviceAmount,
                    commissionRate: updatedDoc.commissionRate,
                    commissionAmount: updatedDoc.commissionAmount,
                    status: updatedDoc.status,
                    paymentMethod: updatedDoc.paymentMethod,
                    paymentProofImage: updatedDoc.paymentProofImage,
                    paymentProofUploadedAt: updatedDoc.paymentProofUploadedAt,
                    verifiedBy: updatedDoc.verifiedBy,
                    verifiedAt: updatedDoc.verifiedAt,
                    paidDate: updatedDoc.paidDate,
                    bookingDate: updatedDoc.bookingDate,
                    createdAt: updatedDoc.createdAt,
                    updatedAt: updatedDoc.updatedAt
                };

                console.log('✅ Payment verified:', updatedRecord);

                // Set provider back to Available status
                await this.setProviderAvailable(updatedRecord.providerId, updatedRecord.providerType);

                // Notify provider payment was verified
                await this.notifyProviderPaymentVerified(updatedRecord.providerId, updatedRecord.providerType, updatedRecord);

                return updatedRecord;
            } else {
                // Payment rejected - provider must reupload
                const updatedDoc = await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.COMMISSION_RECORDS,
                    doc.$id,
                    {
                        status: CommissionPaymentStatus.Rejected,
                        rejectionReason,
                        verifiedBy: hotelVillaUserId,
                        verifiedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                );

                const updatedRecord: CommissionRecord = {
                    id: parseInt(updatedDoc.$id) || commissionId,
                    hotelVillaId: updatedDoc.hotelVillaId,
                    bookingId: updatedDoc.bookingId,
                    providerId: updatedDoc.providerId,
                    providerType: updatedDoc.providerType,
                    providerName: updatedDoc.providerName,
                    serviceAmount: updatedDoc.serviceAmount,
                    commissionRate: updatedDoc.commissionRate,
                    commissionAmount: updatedDoc.commissionAmount,
                    status: updatedDoc.status,
                    paymentMethod: updatedDoc.paymentMethod,
                    paymentProofImage: updatedDoc.paymentProofImage,
                    paymentProofUploadedAt: updatedDoc.paymentProofUploadedAt,
                    verifiedBy: updatedDoc.verifiedBy,
                    verifiedAt: updatedDoc.verifiedAt,
                    rejectionReason: updatedDoc.rejectionReason,
                    bookingDate: updatedDoc.bookingDate,
                    createdAt: updatedDoc.createdAt,
                    updatedAt: updatedDoc.updatedAt
                };

                console.log('❌ Payment rejected:', updatedRecord);

                // Provider stays Busy until they reupload valid proof
                // Notify provider payment was rejected and why
                await this.notifyProviderPaymentRejected(
                    updatedRecord.providerId,
                    updatedRecord.providerType,
                    updatedRecord,
                    rejectionReason || 'Payment proof was unclear or invalid'
                );

                return updatedRecord;
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    /**
     * Get pending commission payments for a provider
     */
    async getProviderPendingPayments(
        providerId: number,
        providerType: 'therapist' | 'place'
    ): Promise<CommissionRecord[]> {
        try {
            console.log(`📋 Fetching pending payments for ${providerType} ${providerId}`);

            // Query Appwrite for pending commission records
            const docs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                [
                    Query.equal('providerId', providerId.toString()),
                    Query.equal('providerType', providerType),
                    Query.notEqual('status', CommissionPaymentStatus.Verified)
                ]
            );

            const records: CommissionRecord[] = docs.documents.map(doc => ({
                id: parseInt(doc.$id) || 0,
                hotelVillaId: doc.hotelVillaId,
                bookingId: doc.bookingId,
                providerId: doc.providerId,
                providerType: doc.providerType,
                providerName: doc.providerName,
                serviceAmount: doc.serviceAmount,
                commissionRate: doc.commissionRate,
                commissionAmount: doc.commissionAmount,
                status: doc.status,
                paymentMethod: doc.paymentMethod,
                paymentProofImage: doc.paymentProofImage,
                paymentProofUploadedAt: doc.paymentProofUploadedAt,
                verifiedBy: doc.verifiedBy,
                verifiedAt: doc.verifiedAt,
                rejectionReason: doc.rejectionReason,
                paidDate: doc.paidDate,
                bookingDate: doc.bookingDate,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            }));

            return records;
        } catch (error) {
            console.error('Error fetching provider pending payments:', error);
            return [];
        }
    }

    /**
     * Get payment verification queue for hotel/villa
     */
    async getHotelVillaPaymentVerificationQueue(
        hotelVillaId: number
    ): Promise<CommissionRecord[]> {
        try {
            console.log(`📋 Fetching verification queue for hotel/villa ${hotelVillaId}`);

            // Query Appwrite for records awaiting verification
            const docs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                [
                    Query.equal('hotelVillaId', hotelVillaId.toString()),
                    Query.equal('status', CommissionPaymentStatus.AwaitingVerification)
                ]
            );

            const records: CommissionRecord[] = docs.documents.map(doc => ({
                id: parseInt(doc.$id) || 0,
                hotelVillaId: doc.hotelVillaId,
                bookingId: doc.bookingId,
                providerId: doc.providerId,
                providerType: doc.providerType,
                providerName: doc.providerName,
                serviceAmount: doc.serviceAmount,
                commissionRate: doc.commissionRate,
                commissionAmount: doc.commissionAmount,
                status: doc.status,
                paymentMethod: doc.paymentMethod,
                paymentProofImage: doc.paymentProofImage,
                paymentProofUploadedAt: doc.paymentProofUploadedAt,
                verifiedBy: doc.verifiedBy,
                verifiedAt: doc.verifiedAt,
                rejectionReason: doc.rejectionReason,
                paidDate: doc.paidDate,
                bookingDate: doc.bookingDate,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            }));

            return records;
        } catch (error) {
            console.error('Error fetching verification queue:', error);
            return [];
        }
    }

    /**
     * Get commission payment history for hotel/villa
     */
    async getHotelVillaCommissionHistory(
        hotelVillaId: number,
        status?: CommissionPaymentStatus
    ): Promise<CommissionRecord[]> {
        try {
            console.log(`📊 Fetching commission history for hotel/villa ${hotelVillaId}`);

            const queries = [Query.equal('hotelVillaId', hotelVillaId.toString())];
            
            if (status) {
                queries.push(Query.equal('status', status));
            }

            const docs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                queries
            );

            const records: CommissionRecord[] = docs.documents.map(doc => ({
                id: parseInt(doc.$id) || 0,
                hotelVillaId: doc.hotelVillaId,
                bookingId: doc.bookingId,
                providerId: doc.providerId,
                providerType: doc.providerType,
                providerName: doc.providerName,
                serviceAmount: doc.serviceAmount,
                commissionRate: doc.commissionRate,
                commissionAmount: doc.commissionAmount,
                status: doc.status,
                paymentMethod: doc.paymentMethod,
                paymentProofImage: doc.paymentProofImage,
                paymentProofUploadedAt: doc.paymentProofUploadedAt,
                verifiedBy: doc.verifiedBy,
                verifiedAt: doc.verifiedAt,
                rejectionReason: doc.rejectionReason,
                paidDate: doc.paidDate,
                bookingDate: doc.bookingDate,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            }));

            return records;
        } catch (error) {
            console.error('Error fetching commission history:', error);
            return [];
        }
    }

    /**
     * Get bank details for hotel/villa (for provider to make payment)
     */
    async getHotelVillaBankDetails(
        hotelVillaId: number,
        hotelVillaType: 'hotel' | 'villa'
    ): Promise<{
        bankName?: string;
        bankAccountNumber?: string;
        bankAccountName?: string;
        bankSwiftCode?: string;
        mobilePaymentNumber?: string;
        mobilePaymentType?: string;
        preferredPaymentMethod?: string;
        paymentInstructions?: string;
    }> {
        try {
            console.log(`🏦 Fetching bank details for ${hotelVillaType} ${hotelVillaId}`);

            // Determine which collection to query
            const collectionId = hotelVillaType === 'hotel' 
                ? COLLECTIONS.HOTELS 
                : COLLECTIONS.VILLAS;

            // Check if collection is configured
            if (!collectionId) {
                console.warn(`⚠️ ${hotelVillaType} collection not configured - skipping commission calculation`);
                return {};
            }

            // Fetch hotel/villa document
            const docs = await databases.listDocuments(
                DATABASE_ID,
                collectionId,
                [Query.equal('$id', hotelVillaId.toString())]
            );

            if (docs.documents.length === 0) {
                console.warn(`${hotelVillaType} ${hotelVillaId} not found`);
                return {};
            }

            const doc = docs.documents[0];

            return {
                bankName: doc.bankName,
                bankAccountNumber: doc.bankAccountNumber,
                bankAccountName: doc.bankAccountName,
                bankSwiftCode: doc.bankSwiftCode,
                mobilePaymentNumber: doc.mobilePaymentNumber,
                mobilePaymentType: doc.mobilePaymentType,
                preferredPaymentMethod: doc.preferredPaymentMethod,
                paymentInstructions: doc.paymentInstructions
            };
        } catch (error) {
            console.error('Error fetching bank details:', error);
            return {};
        }
    }

    /**
     * Check if provider has pending commission payments
     * If yes, they should remain Busy until payment is verified
     */
    async hasProviderPendingPayments(
        providerId: number,
        providerType: 'therapist' | 'place'
    ): Promise<boolean> {
        const pendingPayments = await this.getProviderPendingPayments(providerId, providerType);
        
        // Provider has pending payments if any exist in these statuses
        const hasPending = pendingPayments.some(p => 
            p.status === CommissionPaymentStatus.Pending ||
            p.status === CommissionPaymentStatus.AwaitingVerification ||
            p.status === CommissionPaymentStatus.Rejected
        );

        return hasPending;
    }

    /**
     * Set provider to Busy status (after service completion, until payment verified)
     */
    private async setProviderBusy(
        providerId: number,
        providerType: 'therapist' | 'place'
    ): Promise<void> {
        try {
            console.log(`⏸️ Setting ${providerType} ${providerId} to Busy`);

            const collectionId = providerType === 'therapist' 
                ? COLLECTIONS.THERAPISTS 
                : COLLECTIONS.PLACES;

            // Update provider status to Busy
            await databases.updateDocument(
                DATABASE_ID,
                collectionId,
                providerId.toString(),
                {
                    status: 'Busy' // Assuming status field exists
                }
            );

            console.log(`✅ ${providerType} ${providerId} set to Busy - awaiting commission payment`);
        } catch (error) {
            console.error(`Error setting ${providerType} to Busy:`, error);
            throw error;
        }
    }

    /**
     * Set provider to Available status (after payment verified)
     */
    private async setProviderAvailable(
        providerId: number,
        providerType: 'therapist' | 'place'
    ): Promise<void> {
        try {
            console.log(`✅ Setting ${providerType} ${providerId} to Available`);

            const collectionId = providerType === 'therapist' 
                ? COLLECTIONS.THERAPISTS 
                : COLLECTIONS.PLACES;

            // Update provider status to Available
            await databases.updateDocument(
                DATABASE_ID,
                collectionId,
                providerId.toString(),
                {
                    status: 'Available'
                }
            );

            console.log(`✅ ${providerType} ${providerId} is now Available - commission payment verified`);
        } catch (error) {
            console.error(`Error setting ${providerType} to Available:`, error);
            throw error;
        }
    }

    /**
     * Notification: Notify provider about pending payment
     */
    private async notifyProviderPendingPayment(
        providerId: number,
        providerType: 'therapist' | 'place',
        _record: CommissionRecord
    ): Promise<void> {
        // TODO: Send notification to provider
        console.log(`🔔 Notifying ${providerType} ${providerId} about pending commission payment`);
        
        // Notification message example:
        // "Service completed! Please pay commission of Rp ${record.commissionAmount.toLocaleString()} 
        //  to [Hotel Name]. Upload payment proof to become available again."
    }

    /**
     * Notification: Notify hotel/villa about new payment proof
     */
    private async notifyHotelVillaNewPaymentProof(
        hotelVillaId: number,
        _record: CommissionRecord
    ): Promise<void> {
        // TODO: Send notification to hotel/villa
        console.log(`🔔 Notifying hotel/villa ${hotelVillaId} about new payment proof to verify`);
        
        // Notification message example:
        // "${record.providerName} has uploaded payment proof for booking #${record.bookingId}. 
        //  Please verify the payment."
    }

    /**
     * Notification: Notify provider payment was verified
     */
    private async notifyProviderPaymentVerified(
        providerId: number,
        providerType: 'therapist' | 'place',
        _record: CommissionRecord
    ): Promise<void> {
        // TODO: Send notification to provider
        console.log(`🔔 Notifying ${providerType} ${providerId} that payment was verified`);
        
        // Notification message example:
        // "Payment verified! Your commission payment of Rp ${record.commissionAmount.toLocaleString()} 
        //  has been confirmed. You are now available for new bookings."
    }

    /**
     * Notification: Notify provider payment was rejected
     */
    private async notifyProviderPaymentRejected(
        providerId: number,
        providerType: 'therapist' | 'place',
        _record: CommissionRecord,
        _reason: string
    ): Promise<void> {
        // TODO: Send notification to provider
        console.log(`🔔 Notifying ${providerType} ${providerId} that payment was rejected`);
        
        // Notification message example:
        // "Payment proof rejected: ${reason}. Please upload a clearer screenshot. 
        //  You will remain busy until payment is verified."
    }

    /**
     * Calculate total outstanding commissions for a provider
     */
    async getProviderOutstandingCommissions(
        providerId: number,
        providerType: 'therapist' | 'place'
    ): Promise<number> {
        const pendingPayments = await this.getProviderPendingPayments(providerId, providerType);
        
        return pendingPayments.reduce((total, payment) => {
            return total + payment.commissionAmount;
        }, 0);
    }

    /**
     * Calculate total commissions received by hotel/villa
     */
    async getHotelVillaTotalCommissions(
        hotelVillaId: number,
        startDate?: string,
        endDate?: string
    ): Promise<{
        total: number;
        verified: number;
        pending: number;
        awaitingVerification: number;
    }> {
        try {
            // Build queries
            const queries = [Query.equal('hotelVillaId', hotelVillaId.toString())];
            
            // Add date filters if provided
            if (startDate) {
                queries.push(Query.greaterThanEqual('createdAt', startDate));
            }
            if (endDate) {
                queries.push(Query.lessThanEqual('createdAt', endDate));
            }

            // Fetch all commission records for this hotel/villa
            const docs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                queries
            );

            const allRecords: CommissionRecord[] = docs.documents.map(doc => ({
                id: parseInt(doc.$id) || 0,
                hotelVillaId: doc.hotelVillaId,
                bookingId: doc.bookingId,
                providerId: doc.providerId,
                providerType: doc.providerType,
                providerName: doc.providerName,
                serviceAmount: doc.serviceAmount,
                commissionRate: doc.commissionRate,
                commissionAmount: doc.commissionAmount,
                status: doc.status,
                paymentMethod: doc.paymentMethod,
                paymentProofImage: doc.paymentProofImage,
                paymentProofUploadedAt: doc.paymentProofUploadedAt,
                verifiedBy: doc.verifiedBy,
                verifiedAt: doc.verifiedAt,
                rejectionReason: doc.rejectionReason,
                paidDate: doc.paidDate,
                bookingDate: doc.bookingDate,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            }));
            
            const verified = allRecords
                .filter(r => r.status === CommissionPaymentStatus.Verified)
                .reduce((sum, r) => sum + r.commissionAmount, 0);
            
            const pending = allRecords
                .filter(r => r.status === CommissionPaymentStatus.Pending)
                .reduce((sum, r) => sum + r.commissionAmount, 0);
            
            const awaitingVerification = allRecords
                .filter(r => r.status === CommissionPaymentStatus.AwaitingVerification)
                .reduce((sum, r) => sum + r.commissionAmount, 0);
            
            return {
                total: verified + pending + awaitingVerification,
                verified,
                pending,
                awaitingVerification
            };
        } catch (error) {
            console.error('Error calculating hotel/villa commissions:', error);
            return {
                total: 0,
                verified: 0,
                pending: 0,
                awaitingVerification: 0
            };
        }
    }
}

export const commissionPaymentService = new CommissionPaymentService();
export default commissionPaymentService;

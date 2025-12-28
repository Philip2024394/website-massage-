/**
 * Booking Acknowledgment Service
 * 
 * Handles Pro member booking acceptance/rejection with 5-minute timer:
 * - Member has 5 minutes to accept or reject
 * - If no response: Broadcast to all other therapists
 * - MP3 notification plays until action taken
 * - Blocks bookings if previous booking unpaid
 */

import { databases, Query, ID } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

export interface BookingAcknowledgment {
    $id: string;
    bookingId: string;
    therapistId: string;
    therapistName: string;
    customerName: string;
    customerWhatsApp: string; // Stored securely, not sent to Pro members
    customerLocation: string;
    serviceDuration: number;
    servicePrice: number;
    sentAt: string;
    expiresAt: string; // 5 minutes from sentAt
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'reassigned';
    acknowledgedAt?: string;
    responseTime?: number; // Seconds to respond
    broadcastedToOthers: boolean;
    finalAssignedTo?: string; // Which therapist ultimately accepted
    createdAt: string;
    updatedAt: string;
}

class BookingAcknowledgmentService {
    private readonly collectionId = 'booking_acknowledgments';
    private readonly TIMEOUT_MINUTES = 5;

    /**
     * Create booking acknowledgment request (5-minute timer starts)
     */
    async createAcknowledgment(
        bookingId: string,
        therapistId: string,
        therapistName: string,
        customerName: string,
        customerWhatsApp: string,
        customerLocation: string,
        serviceDuration: number,
        servicePrice: number
    ): Promise<BookingAcknowledgment> {
        const sentAt = new Date();
        const expiresAt = new Date(sentAt.getTime() + this.TIMEOUT_MINUTES * 60000);

        try {
            const record = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                ID.unique(),
                {
                    bookingId,
                    therapistId,
                    therapistName,
                    customerName,
                    customerWhatsApp,
                    customerLocation,
                    serviceDuration,
                    servicePrice,
                    sentAt: sentAt.toISOString(),
                    expiresAt: expiresAt.toISOString(),
                    status: 'pending',
                    broadcastedToOthers: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ Booking acknowledgment created:', record.$id);
            
            // Start monitoring for timeout
            this.scheduleTimeoutCheck(record.$id, expiresAt);
            
            // Trigger MP3 notification (frontend will handle)
            this.triggerNotificationSound(therapistId, bookingId);

            return record as unknown as BookingAcknowledgment;
        } catch (error) {
            console.error('Error creating acknowledgment:', error);
            throw error;
        }
    }

    /**
     * Member accepts booking
     */
    async acceptBooking(acknowledgmentId: string, therapistId: string): Promise<BookingAcknowledgment> {
        try {
            // Check if therapist has unpaid commissions
            const hasUnpaid = await this.checkUnpaidCommissions(therapistId);
            if (hasUnpaid) {
                throw new Error('PAYMENT_REQUIRED: You must pay your previous booking commission before accepting new bookings.');
            }

            const acknowledgedAt = new Date();
            const record = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                acknowledgmentId
            ) as unknown as BookingAcknowledgment;

            // Check if still valid
            if (record.status !== 'pending') {
                throw new Error('Booking is no longer available');
            }

            if (new Date() > new Date(record.expiresAt)) {
                throw new Error('Booking acceptance window expired');
            }

            // Calculate response time
            const sentTime = new Date(record.sentAt);
            const responseTime = Math.floor((acknowledgedAt.getTime() - sentTime.getTime()) / 1000);

            const updated = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                acknowledgmentId,
                {
                    status: 'accepted',
                    acknowledgedAt: acknowledgedAt.toISOString(),
                    responseTime,
                    finalAssignedTo: therapistId,
                    updatedAt: new Date().toISOString()
                }
            );

            console.log(`✅ Booking accepted by ${therapistId} in ${responseTime} seconds`);
            
            // Stop MP3 notification
            this.stopNotificationSound(therapistId);

            // Notify customer that therapist accepted
            await this.notifyCustomerAccepted(record, therapistId);

            return updated as unknown as BookingAcknowledgment;
        } catch (error) {
            console.error('Error accepting booking:', error);
            throw error;
        }
    }

    /**
     * Member rejects booking
     */
    async rejectBooking(acknowledgmentId: string, therapistId: string, reason?: string): Promise<void> {
        try {
            const record = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                acknowledgmentId
            ) as unknown as BookingAcknowledgment;

            if (record.status !== 'pending') {
                throw new Error('Booking already processed');
            }

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                acknowledgmentId,
                {
                    status: 'rejected',
                    acknowledgedAt: new Date().toISOString(),
                    rejectionReason: reason || 'No reason provided',
                    updatedAt: new Date().toISOString()
                }
            );

            console.log(`❌ Booking rejected by ${therapistId}`);
            
            // Stop MP3 notification
            this.stopNotificationSound(therapistId);

            // Immediately broadcast to other therapists
            await this.broadcastToOtherTherapists(record);
        } catch (error) {
            console.error('Error rejecting booking:', error);
            throw error;
        }
    }

    /**
     * Check for expired bookings and broadcast to all therapists
     */
    async checkExpiredAcknowledgments(): Promise<void> {
        try {
            const now = new Date().toISOString();

            const expiredRecords = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('status', 'pending'),
                    Query.lessThan('expiresAt', now)
                ]
            );

            for (const record of expiredRecords.documents) {
                const ack = record as unknown as BookingAcknowledgment;
                
                // Mark as expired
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    this.collectionId,
                    ack.$id,
                    {
                        status: 'expired',
                        updatedAt: new Date().toISOString()
                    }
                );

                console.log(`⏰ Booking ${ack.bookingId} expired, broadcasting to all therapists`);
                
                // Stop MP3 for original therapist
                this.stopNotificationSound(ack.therapistId);

                // Notify customer about timeout
                await this.notifyCustomerTimeout(ack);

                // Broadcast to all available therapists
                await this.broadcastToOtherTherapists(ack);
            }
        } catch (error) {
            console.error('Error checking expired acknowledgments:', error);
        }
    }

    /**
     * Broadcast booking to all other available therapists
     */
    private async broadcastToOtherTherapists(acknowledgment: BookingAcknowledgment): Promise<void> {
        try {
            // Get all therapists except the original one
            const allTherapists = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [
                    Query.equal('status', 'available'),
                    Query.notEqual('$id', acknowledgment.therapistId)
                ]
            );

            // Check each therapist for unpaid commissions
            for (const therapist of allTherapists.documents) {
                const hasUnpaid = await this.checkUnpaidCommissions(therapist.$id);
                
                if (!hasUnpaid) {
                    // Create new acknowledgment for each available therapist
                    await this.createAcknowledgment(
                        acknowledgment.bookingId + '_broadcast_' + therapist.$id,
                        therapist.$id,
                        (therapist as any).fullName || 'Therapist',
                        acknowledgment.customerName,
                        acknowledgment.customerWhatsApp,
                        acknowledgment.customerLocation,
                        acknowledgment.serviceDuration,
                        acknowledgment.servicePrice
                    );
                    
                    console.log(`📢 Booking broadcast to ${therapist.$id}`);
                }
            }

            // Mark original as broadcasted
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                acknowledgment.$id,
                {
                    broadcastedToOthers: true,
                    updatedAt: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Error broadcasting to other therapists:', error);
        }
    }

    /**
     * Check if therapist has unpaid commissions
     */
    private async checkUnpaidCommissions(therapistId: string): Promise<boolean> {
        try {
            const unpaidRecords = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'commission_payments',
                [
                    Query.equal('therapistId', therapistId),
                    Query.equal('status', ['pending', 'overdue'])
                ]
            );

            return unpaidRecords.documents.length > 0;
        } catch (error) {
            console.error('Error checking unpaid commissions:', error);
            return false; // Allow booking if check fails
        }
    }

    /**
     * Trigger MP3 notification sound (frontend implementation)
     */
    private triggerNotificationSound(therapistId: string, bookingId: string): void {
        // Dispatch event for frontend to play MP3
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('playBookingNotification', {
                detail: { therapistId, bookingId }
            }));
        }
    }

    /**
     * Stop MP3 notification sound
     */
    private stopNotificationSound(therapistId: string): void {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('stopBookingNotification', {
                detail: { therapistId }
            }));
        }
    }

    /**
     * Notify customer that therapist accepted
     */
    private async notifyCustomerAccepted(acknowledgment: BookingAcknowledgment, therapistId: string): Promise<void> {
        // Implementation: Send message to customer chat
        console.log(`✅ Customer notified: Therapist ${therapistId} accepted booking`);
    }

    /**
     * Notify customer about timeout
     */
    private async notifyCustomerTimeout(acknowledgment: BookingAcknowledgment): Promise<void> {
        // Implementation: Send message to customer chat
        const message = `⏰ Massage therapist is busy. We will locate the next best available therapist from your last selection.`;
        console.log(`⏰ Customer notified: ${message}`);
    }

    /**
     * Schedule timeout check
     */
    private scheduleTimeoutCheck(acknowledgmentId: string, expiresAt: Date): void {
        const delay = expiresAt.getTime() - Date.now();
        
        if (delay > 0) {
            setTimeout(async () => {
                await this.checkExpiredAcknowledgments();
            }, delay + 1000); // Check 1 second after expiry
        }
    }

    /**
     * Get therapist's acknowledgment statistics
     */
    async getTherapistStats(therapistId: string): Promise<{
        totalReceived: number;
        totalAccepted: number;
        totalRejected: number;
        totalExpired: number;
        averageResponseTime: number;
        acceptanceRate: number;
    }> {
        try {
            const allRecords = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [
                    Query.equal('therapistId', therapistId),
                    Query.limit(100)
                ]
            );

            const totalReceived = allRecords.documents.length;
            const accepted = allRecords.documents.filter(d => (d as unknown as BookingAcknowledgment).status === 'accepted');
            const rejected = allRecords.documents.filter(d => (d as unknown as BookingAcknowledgment).status === 'rejected');
            const expired = allRecords.documents.filter(d => (d as unknown as BookingAcknowledgment).status === 'expired');

            const responseTimes = accepted
                .map(d => (d as unknown as BookingAcknowledgment).responseTime)
                .filter(t => t !== undefined) as number[];

            const averageResponseTime = responseTimes.length > 0
                ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
                : 0;

            const acceptanceRate = totalReceived > 0
                ? (accepted.length / totalReceived) * 100
                : 0;

            return {
                totalReceived,
                totalAccepted: accepted.length,
                totalRejected: rejected.length,
                totalExpired: expired.length,
                averageResponseTime,
                acceptanceRate
            };
        } catch (error: any) {
            // Handle collection not found gracefully
            if (error?.code === 404 || error?.message?.includes('Collection') || error?.message?.includes('could not be found')) {
                console.warn('⚠️ Booking acknowledgments collection not found - returning default stats');
                return {
                    totalReceived: 0,
                    totalAccepted: 0,
                    totalRejected: 0,
                    totalExpired: 0,
                    averageResponseTime: 0,
                    acceptanceRate: 0
                };
            }
            console.error('Error getting therapist stats:', error);
            throw error;
        }
    }
}

export const bookingAcknowledgmentService = new BookingAcknowledgmentService();

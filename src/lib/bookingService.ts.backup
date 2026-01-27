/**
 * Booking Service with Real-time Updates and Alternative Therapist Search
 * Handles booking lifecycle, status updates, and notifications
 */

import { databases, ID, Query } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { MessageSenderType } from '../types';
import * as chatService from './chatService';
import { commissionTrackingService } from './services/commissionTrackingService';
import { systemMessageService } from './services/systemMessage.service';
import { validateBookingSchema, mapToAppwriteSchema } from './validation/bookingSchemaValidator';

export interface Booking {
    $id?: string;
    $createdAt?: string;
    bookingId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerWhatsApp?: string;
    therapistId: string;
    therapistName: string;
    therapistType: 'therapist' | 'place';
    serviceType: string;
    duration: number;
    price: number;
    location: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'searching';
    responseDeadline?: string;
    createdAt?: string;
    updatedAt?: string;
    notes?: string;
    cancelReason?: string;
    alternativeSearch?: boolean;
    searchStartedAt?: string;
}

export interface AlternativeTherapistSearchResult {
    therapistId: string;
    therapistName: string;
    distance: number;
    price: number;
    rating: number;
    available: boolean;
}

/**
 * Booking Service - Complete booking lifecycle management
 */
export const bookingService = {
    /**
     * Create a new booking
     */
    async createBooking(bookingData: Omit<Booking, '$id' | '$createdAt' | 'bookingId'>): Promise<Booking> {
        try {
            const bookingId = `BK${Date.now()}`;
            const responseDeadline = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

            // 🔥 CRITICAL FIX: Map to proper Appwrite schema fields
            const mappedData = mapToAppwriteSchema({
                ...bookingData,
                bookingId,
                status: 'Pending', // Capitalize for schema
                responseDeadline,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                alternativeSearch: false
            });

            // 🔒 SCHEMA DRIFT LOCK: Validate before saving
            const validatedData = validateBookingSchema(mappedData);
            
            console.log('✅ Schema validation passed for booking:', bookingId);

            const booking = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                ID.unique(),
                validatedData
            );

            console.log('✅ Booking created:', booking.$id);

            // 🔥 CRITICAL FIX: Create chat room immediately
            try {
                const chatService = await import('./chatService');
                const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString(); // 25 min
                
                const chatRoom = await chatService.createChatRoom({
                    bookingId: booking.$id,
                    customerId: bookingData.customerId,
                    customerName: bookingData.customerName,
                    customerLanguage: 'en',
                    customerPhoto: '',
                    therapistId: bookingData.therapistId,
                    therapistName: bookingData.therapistName,
                    therapistLanguage: 'id',
                    therapistType: bookingData.therapistType || 'therapist',
                    therapistPhoto: '',
                    expiresAt
                });
                
                console.log('✅ Chat room created:', chatRoom.$id);
                
                // Send initial system message to chat
                await chatService.sendBookingReceivedMessage(chatRoom.$id, bookingData.therapistId);
                
            } catch (chatError) {
                console.error('❌ CRITICAL: Chat room creation failed:', chatError);
                // Don't fail the booking, but log for monitoring
            }

            // Notify therapist
            await this.notifyTherapist(booking as unknown as Booking);

            // Schedule alternative search after 5 minutes
            setTimeout(() => {
                this.checkAndSearchAlternative(booking.$id);
            }, 5 * 60 * 1000);

            return booking as unknown as Booking;
        } catch (error) {
            console.error('❌ Error creating booking:', error);
            throw error;
        }
    },

    /**
     * Update booking status
     */
    async updateBookingStatus(
        bookingId: string,
        status: Booking['status'],
        additionalData?: Partial<Booking>
    ): Promise<Booking> {
        try {
            const updates: any = {
                status,
                updatedAt: new Date().toISOString(),
                ...additionalData
            };

            const booking = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                bookingId,
                updates
            );

            console.log(`✅ Booking ${bookingId} status updated to:`, status);

            // Send status update to chat
            await this.sendStatusUpdateMessage(booking as unknown as Booking);

            return booking as unknown as Booking;
        } catch (error) {
            console.error('❌ Error updating booking status:', error);
            throw error;
        }
    },

    /**
     * 🔒 SINGLE SOURCE OF TRUTH: Accept booking and create commission
     * ============================================================================
     * This is the ONLY function that marks bookings as ACCEPTED
     * ALL acceptance paths MUST call this function
     * ============================================================================
     * 
     * ATOMIC OPERATION:
     * 1. Verify booking is PENDING
     * 2. Check for duplicate acceptance (idempotency)
     * 3. Update booking → ACCEPTED
     * 4. Create commission record (30%)
     * 5. Write audit trail
     * 6. Send notifications
     * 
     * If ANY step fails → ROLLBACK all changes
     */
    async acceptBookingAndCreateCommission(
        bookingId: string, 
        therapistId: string,
        therapistName: string
    ): Promise<{ booking: Booking; commission: any }> {
        console.log('🔒 [ACCEPTANCE AUTHORITY] Starting atomic acceptance:', { bookingId, therapistId });
        
        let bookingUpdated = false;
        let commissionCreated = false;
        let originalBooking: any = null;

        try {
            // STEP 1: Fetch and verify booking
            originalBooking = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                bookingId
            );

            console.log('📋 [ACCEPTANCE] Current booking status:', originalBooking.status);

            // STEP 2: Validate booking state
            if (!originalBooking) {
                throw new Error('ACCEPTANCE_FAILED: Booking not found');
            }

            const currentStatus = (originalBooking.status || '').toLowerCase();
            
            if (currentStatus === 'accepted' || currentStatus === 'confirmed') {
                // Idempotency check - booking already accepted
                console.warn('⚠️ [ACCEPTANCE] Booking already accepted - checking for existing commission');
                
                // Check if commission exists
                const existingCommissions = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                    [Query.equal('bookingId', bookingId)]
                );

                if (existingCommissions.total > 0) {
                    console.log('✅ [ACCEPTANCE] Idempotency: Returning existing booking + commission');
                    return {
                        booking: originalBooking as unknown as Booking,
                        commission: existingCommissions.documents[0]
                    };
                }

                // Commission missing - will create it below
                console.warn('⚠️ [ACCEPTANCE] Booking accepted but commission missing - creating commission');
            } else if (currentStatus !== 'pending') {
                throw new Error(`ACCEPTANCE_FAILED: Invalid booking status: ${originalBooking.status}`);
            }

            // STEP 3: Verify therapist ID matches
            const bookingTherapistId = originalBooking.providerId || originalBooking.therapistId;
            if (bookingTherapistId && bookingTherapistId !== therapistId) {
                throw new Error(`ACCEPTANCE_FAILED: Booking assigned to different therapist`);
            }

            // STEP 4: Update booking status to ACCEPTED
            console.log('📝 [ACCEPTANCE] Updating booking status → ACCEPTED');
            const acceptedBooking = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                bookingId,
                {
                    status: 'Accepted',
                    acceptedAt: new Date().toISOString(),
                    acceptedBy: therapistId,
                    updatedAt: new Date().toISOString()
                }
            );
            bookingUpdated = true;
            console.log('✅ [ACCEPTANCE] Booking status updated');

            // STEP 5: Check for existing commission (idempotency)
            const existingCommissions = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                [Query.equal('bookingId', bookingId)]
            );

            let commission: any;

            if (existingCommissions.total > 0) {
                console.log('✅ [ACCEPTANCE] Commission already exists (idempotent)');
                commission = existingCommissions.documents[0];
            } else {
                // STEP 6: Create commission record (30%)
                const bookingAmount = originalBooking.price || originalBooking.totalAmount || 0;
                const commissionAmount = Math.round(bookingAmount * 0.30);
                const now = new Date();
                const paymentDeadline = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours

                console.log('💰 [ACCEPTANCE] Creating commission record:', {
                    bookingAmount,
                    commissionAmount,
                    rate: '30%'
                });

                commission = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                    ID.unique(),
                    {
                        commissionId: `COM_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                        bookingId: bookingId,
                        therapistId: therapistId,
                        therapistName: therapistName,
                        bookingAmount: bookingAmount,
                        commissionRate: 0.30,
                        commissionAmount: commissionAmount,
                        status: 'pending',
                        reactivationFeeRequired: false,
                        reactivationFeeAmount: 0,
                        reactivationFeePaid: false,
                        totalAmountDue: commissionAmount,
                        completedAt: now.toISOString(),
                        paymentDeadline: paymentDeadline.toISOString(),
                        createdAt: now.toISOString(),
                        updatedAt: now.toISOString()
                    }
                );
                commissionCreated = true;
                console.log('✅ [ACCEPTANCE] Commission created:', commission.$id);
            }

            // STEP 7: Write audit trail
            console.log('📝 [ACCEPTANCE] Writing audit trail');
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.auditLogs || 'audit_logs',
                ID.unique(),
                {
                    action: 'BOOKING_ACCEPTED',
                    bookingId: bookingId,
                    therapistId: therapistId,
                    therapistName: therapistName,
                    commissionId: commission.$id,
                    commissionAmount: commission.commissionAmount,
                    timestamp: new Date().toISOString(),
                    metadata: JSON.stringify({
                        bookingAmount: originalBooking.price || originalBooking.totalAmount,
                        commissionRate: 0.30,
                        paymentDeadline: commission.paymentDeadline
                    })
                }
            ).catch(err => {
                console.warn('⚠️ [ACCEPTANCE] Audit log creation failed (non-critical):', err);
            });

            // STEP 8: Send notifications
            console.log('📬 [ACCEPTANCE] Sending notifications');
            await this.notifyCustomer(acceptedBooking as unknown as Booking, 'confirmed').catch(err => {
                console.warn('⚠️ [ACCEPTANCE] Customer notification failed (non-critical):', err);
            });

            console.log('✅ [ACCEPTANCE AUTHORITY] Acceptance completed successfully');
            console.log(`   Booking: ${bookingId} → ACCEPTED`);
            console.log(`   Commission: ${commission.$id} → ${commission.commissionAmount} IDR`);
            console.log(`   Payment Deadline: ${commission.paymentDeadline}`);

            return {
                booking: acceptedBooking as unknown as Booking,
                commission: commission
            };

        } catch (error: any) {
            console.error('❌ [ACCEPTANCE AUTHORITY] Acceptance failed:', error);

            // ROLLBACK: Revert booking status if it was updated
            if (bookingUpdated && originalBooking) {
                try {
                    console.log('🔄 [ACCEPTANCE] Rolling back booking status');
                    await databases.updateDocument(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.bookings || 'bookings',
                        bookingId,
                        {
                            status: originalBooking.status,
                            updatedAt: new Date().toISOString()
                        }
                    );
                    console.log('✅ [ACCEPTANCE] Rollback successful');
                } catch (rollbackError) {
                    console.error('❌ [ACCEPTANCE] CRITICAL: Rollback failed:', rollbackError);
                    // Log to monitoring system
                }
            }

            // Re-throw with detailed error
            throw new Error(`ACCEPTANCE_FAILED: ${error.message || error}`);
        }
    },

    /**
     * Therapist confirms booking (DEPRECATED - Use acceptBookingAndCreateCommission)
     * Kept for backward compatibility but redirects to new function
     */
    async confirmBooking(bookingId: string, therapistId: string): Promise<Booking> {
        console.warn('⚠️ DEPRECATED: confirmBooking() called - use acceptBookingAndCreateCommission()');
        try {
            // Get therapist name
            const therapist = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists || 'therapists',
                therapistId
            ).catch(() => ({ name: 'Unknown Therapist' }));

            const result = await this.acceptBookingAndCreateCommission(
                bookingId,
                therapistId,
                therapist.name || 'Unknown Therapist'
            );

            return result.booking;
        } catch (error) {
            console.error('❌ Error confirming booking:', error);
            throw error;
        }
    },

    /**
     * Therapist rejects booking
     */
    async rejectBooking(bookingId: string, therapistId: string, reason?: string): Promise<void> {
        try {
            await this.updateBookingStatus(bookingId, 'cancelled', {
                cancelReason: reason || 'Therapist unavailable',
                cancelledAt: new Date().toISOString()
            } as any);

            // Start alternative search
            await this.searchAlternativeTherapist(bookingId);
        } catch (error) {
            console.error('❌ Error rejecting booking:', error);
            throw error;
        }
    },

    /**
     * 🔒 COMMISSION REVERSAL: Cancel booking and reverse commission
     * ============================================================================
     * Legally required: If booking is accepted and commission created,
     * cancellation must REVERSE (not delete) the commission record
     * ============================================================================
     * 
     * ATOMIC OPERATION:
     * 1. Verify booking exists
     * 2. Update booking → CANCELLED
     * 3. Find commission record
     * 4. Mark commission as REVERSED (preserve history)
     * 5. Write audit trail with reason
     * 6. Send notifications
     */
    async cancelBookingAndReverseCommission(
        bookingId: string,
        cancelledBy: string,
        cancelReason: string,
        actorType: 'therapist' | 'customer' | 'admin'
    ): Promise<{ booking: Booking; commission: any | null }> {
        console.log('🔄 [CANCELLATION] Starting cancellation with commission reversal:', { 
            bookingId, 
            cancelledBy,
            cancelReason,
            actorType
        });

        try {
            // STEP 1: Fetch booking
            const booking = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                bookingId
            );

            if (!booking) {
                throw new Error('CANCELLATION_FAILED: Booking not found');
            }

            console.log('📋 [CANCELLATION] Current booking status:', booking.status);

            // STEP 2: Update booking status to CANCELLED
            const cancelledBooking = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                bookingId,
                {
                    status: 'Cancelled',
                    cancelReason: cancelReason,
                    cancelledAt: new Date().toISOString(),
                    cancelledBy: cancelledBy,
                    cancelledByType: actorType,
                    updatedAt: new Date().toISOString()
                }
            );
            console.log('✅ [CANCELLATION] Booking status updated → CANCELLED');

            // STEP 3: Check for commission record
            const commissions = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                [Query.equal('bookingId', bookingId)]
            );

            let reversedCommission = null;

            if (commissions.total > 0) {
                const commission = commissions.documents[0];
                console.log('💰 [CANCELLATION] Commission found:', commission.$id, '- Status:', commission.status);

                // STEP 4: Reverse commission if pending (preserve history - don't delete)
                if (commission.status === 'pending') {
                    reversedCommission = await databases.updateDocument(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                        commission.$id,
                        {
                            status: 'reversed',
                            reversalReason: cancelReason,
                            reversedAt: new Date().toISOString(),
                            reversedBy: cancelledBy,
                            reversedByType: actorType,
                            updatedAt: new Date().toISOString()
                        }
                    );
                    console.log('✅ [CANCELLATION] Commission reversed:', reversedCommission.$id);
                } else {
                    console.log(`ℹ️ [CANCELLATION] Commission status is '${commission.status}' - no reversal needed`);
                    reversedCommission = commission;
                }
            } else {
                console.log('ℹ️ [CANCELLATION] No commission record found (booking may not have been accepted)');
            }

            // STEP 5: Write audit trail
            console.log('📝 [CANCELLATION] Writing audit trail');
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.auditLogs || 'audit_logs',
                ID.unique(),
                {
                    action: 'BOOKING_CANCELLED',
                    bookingId: bookingId,
                    cancelledBy: cancelledBy,
                    cancelledByType: actorType,
                    cancelReason: cancelReason,
                    commissionId: reversedCommission?.$id || null,
                    commissionReversed: reversedCommission?.status === 'reversed',
                    timestamp: new Date().toISOString(),
                    metadata: JSON.stringify({
                        originalStatus: booking.status,
                        commissionAmount: reversedCommission?.commissionAmount || 0,
                        reversalReason: cancelReason
                    })
                }
            ).catch(err => {
                console.warn('⚠️ [CANCELLATION] Audit log creation failed (non-critical):', err);
            });

            // STEP 6: Send notifications
            console.log('📬 [CANCELLATION] Sending notifications');
            if (actorType === 'therapist') {
                await this.notifyCustomer(cancelledBooking as unknown as Booking, 'cancelled').catch(err => {
                    console.warn('⚠️ [CANCELLATION] Customer notification failed (non-critical):', err);
                });
            }

            console.log('✅ [CANCELLATION] Cancellation completed successfully');
            if (reversedCommission && reversedCommission.status === 'reversed') {
                console.log(`   Commission ${reversedCommission.$id} reversed`);
                console.log(`   Reason: ${cancelReason}`);
            }

            return {
                booking: cancelledBooking as unknown as Booking,
                commission: reversedCommission
            };

        } catch (error: any) {
            console.error('❌ [CANCELLATION] Cancellation failed:', error);
            throw new Error(`CANCELLATION_FAILED: ${error.message || error}`);
        }
    },

    /**
     * Complete booking
     */
    async completeBooking(bookingId: string): Promise<Booking> {
        try {
            const updatedBooking = await this.updateBookingStatus(bookingId, 'completed', {
                completedAt: new Date().toISOString()
            } as any);

            // Create commission record for completed booking (idempotent)
            try {
                await this.createCommissionRecord(updatedBooking);
            } catch (commissionError) {
                console.error('❌ Commission creation failed but booking completed:', commissionError);
                // Booking completion still succeeds even if commission fails
            }

            return updatedBooking;
        } catch (error) {
            console.error('❌ Error completing booking:', error);
            throw error;
        }
    },

    /**
     * Customer cancels booking
     */
    async cancelBookingByCustomer(bookingId: string, customerId: string, reason?: string): Promise<void> {
        try {
            await this.updateBookingStatus(bookingId, 'cancelled', {
                cancelReason: reason || 'Cancelled by customer',
                cancelledAt: new Date().toISOString(),
                cancelledBy: customerId
            } as any);
        } catch (error) {
            console.error('❌ Error cancelling booking:', error);
            throw error;
        }
    },

    /**
     * Create commission record for completed booking (idempotent)
     * Only creates commission when booking status becomes 'Completed'
     */
    async createCommissionRecord(booking: Booking): Promise<void> {
        try {
            // Only create commission for completed bookings
            if (booking.status !== 'completed') {
                console.log('📋 Skipping commission - booking not completed:', booking.status);
                return;
            }

            // Idempotent check - avoid duplicate commission records
            const existingRecords = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                [Query.equal('bookingId', booking.bookingId)]
            );

            if (existingRecords.documents.length > 0) {
                console.log('✅ Commission already exists for booking:', booking.bookingId);
                return;
            }

            // Calculate commission amount (30% for Pro membership)
            const commissionAmount = booking.price * 0.30;

            // Create commission record with 3-hour deadline
            await commissionTrackingService.createCommissionRecord(
                booking.therapistId,
                booking.therapistName,
                booking.bookingId,
                commissionAmount,
                (booking as any).completedAt as any || new Date().toISOString()
            );

            console.log('✅ Commission record created for booking:', booking.bookingId);
            console.log('💰 Commission amount:', `$${commissionAmount.toFixed(2)}`);
            console.log('⏰ Deadline: 3 hours from completion');

        } catch (error) {
            console.error('❌ Failed to create commission record:', error);
            throw error; // Re-throw to be caught by completeBooking error handler
        }
    },

    /**
     * Check if response deadline passed and search for alternative
     */
    async checkAndSearchAlternative(bookingId: string): Promise<void> {
        try {
            const booking = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                bookingId
            ) as unknown as Booking;

            // If still pending after deadline, search for alternative
            if (booking.status === 'pending' && !booking.alternativeSearch) {
                console.log('⏰ Response deadline passed for booking:', bookingId);
                await this.searchAlternativeTherapist(bookingId);
            }
        } catch (error) {
            console.error('❌ Error checking alternative search:', error);
        }
    },

    /**
     * Search for alternative therapist
     */
    async searchAlternativeTherapist(bookingId: string): Promise<void> {
        try {
            const booking = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                bookingId
            ) as unknown as Booking;

            // Mark as searching
            await this.updateBookingStatus(bookingId, 'searching', {
                alternativeSearch: true,
                searchStartedAt: new Date().toISOString()
            } as any);

            // Send fallback message to customer
            const conversationId = `customer_${booking.customerId}_therapist_${booking.therapistId}`;
            await chatService.sendMessage({
                roomId: conversationId,
                senderId: 'system',
                senderType: 'system' as MessageSenderType,
                senderName: 'System',
                text: `${booking.therapistName} sedang dalam booking.\n\n🔍 Kami mencari terapis terbaik berikutnya untuk Anda.\n\n✨ Anda akan diberitahu setelah kami menemukan terapis yang tersedia.`,
                senderLanguage: 'id',
                recipientLanguage: 'id'
            });

            // Notify admin
            await this.notifyAdmin(booking, 'alternative_search_needed');

            // Perform actual search
            const alternatives = await this.findAlternativeTherapists(booking);

            if (alternatives.length > 0) {
                // Notify customer about alternatives
                const altList = alternatives.slice(0, 3).map((alt, idx) =>
                    `${idx + 1}. ${alt.therapistName} - ${alt.distance}km away - Rp ${alt.price.toLocaleString()}`
                ).join('\n');

                await chatService.sendMessage({
                    roomId: conversationId,
                    senderId: 'system',
                    senderType: MessageSenderType.System,
                    senderName: 'System',
                    text: `✅ Kami menemukan terapis alternatif:\n\n${altList}\n\nKami sedang menghubungi mereka sekarang...`,
                    senderLanguage: 'id',
                    recipientLanguage: 'id'
                });

                // Notify alternatives (implement later)
                await this.notifyAlternativeTherapists(alternatives, booking);
            }

            console.log(`✅ Alternative search initiated for booking ${bookingId}`);
        } catch (error) {
            console.error('❌ Error searching for alternative:', error);
        }
    },

    /**
     * Find alternative therapists based on booking criteria
     */
    async findAlternativeTherapists(booking: Booking): Promise<AlternativeTherapistSearchResult[]> {
        try {
            // Query therapists collection
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists || 'therapists',
                [
                    Query.equal('status', 'available'),
                    Query.equal('city', booking.location.split(',')[0]), // Match city
                    Query.limit(10)
                ]
            );

            // Mock distance calculation (replace with actual geolocation)
            const alternatives: AlternativeTherapistSearchResult[] = response.documents
                .filter((t: any) => t.$id !== booking.therapistId)
                .map((therapist: any) => ({
                    therapistId: therapist.$id,
                    therapistName: therapist.name,
                    distance: Math.random() * 5, // Mock distance
                    price: therapist[`price${booking.duration}`] * 1000 || booking.price,
                    rating: therapist.rating || 4.5,
                    available: true
                }))
                .sort((a, b) => a.distance - b.distance);

            return alternatives;
        } catch (error) {
            console.error('❌ Error finding alternatives:', error);
            return [];
        }
    },

    /**
     * Send status update message to chat
     */
    async sendStatusUpdateMessage(booking: Booking): Promise<void> {
        try {
            const conversationId = `customer_${booking.customerId}_therapist_${booking.therapistId}`;
            
            const statusMessages: Record<string, string> = {
                pending: '⏳ Your booking is pending confirmation',
                confirmed: `✅ Your booking has been confirmed!\n\n${booking.therapistName} will arrive at ${booking.time}.\n\nPlease be ready at: ${booking.location}`,
                completed: '🎉 Booking completed! Thank you for using our service.\n\nPlease rate your experience.',
                cancelled: '❌ This booking has been cancelled.',
                searching: '🔍 Searching for an available therapist...'
            };

            await chatService.sendMessage({
                roomId: conversationId,
                senderId: 'system',
                senderType: MessageSenderType.System,
                senderName: 'System',
                text: statusMessages[booking.status] || 'Status booking telah diperbarui',
                senderLanguage: 'id',
                recipientLanguage: 'id'
            });
        } catch (error) {
            console.error('❌ Error sending status update:', error);
        }
    },

    /**
     * Notify therapist about new booking
     */
    async notifyTherapist(booking: Booking): Promise<void> {
        try {
            // 🔥 CRITICAL FIX: Use validated collection ID
            const notificationsCollection = APPWRITE_CONFIG.collections.notifications;
            
            if (!notificationsCollection) {
                throw new Error('Notifications collection not configured in APPWRITE_CONFIG');
            }
            
            const notificationDoc = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                notificationsCollection,
                ID.unique(),
                {
                    userId: booking.therapistId,
                    recipientId: booking.therapistId,
                    recipientType: 'therapist',
                    type: 'new_booking',
                    title: 'New Booking Request! 🎉',
                    message: `${booking.customerName} requested ${booking.duration}min massage`,
                    body: `${booking.customerName} requested ${booking.duration}min massage on ${booking.date}`,
                    data: JSON.stringify({ 
                        bookingId: booking.$id,
                        customerId: booking.customerId,
                        customerName: booking.customerName,
                        serviceType: booking.serviceType,
                        duration: booking.duration,
                        location: booking.location
                    }),
                    isRead: false,
                    priority: 'high',
                    createdAt: new Date().toISOString()
                }
            );

            console.log('✅ Therapist notification created:', notificationDoc.$id);
            
            // 🔥 CRITICAL: Also send browser push notification if service worker available
            try {
                const pushService = await import('./pushNotificationsService');
                await pushService.pushNotificationsService.notifyNewBooking(
                    booking.customerName,
                    `${booking.duration}min ${booking.serviceType}`,
                    booking.$id || '',
                    {
                        customerName: booking.customerName,
                        serviceType: booking.serviceType,
                        duration: booking.duration,
                        location: booking.location
                    }
                );
                console.log('✅ Push notification sent to therapist');
            } catch (pushError) {
                console.warn('⚠️ Push notification failed (non-critical):', pushError);
            }
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR notifying therapist:', error);
            // 🔥 CRITICAL FIX: Don't swallow the error silently
            // Log to monitoring but don't fail the booking
            throw new Error(`Failed to notify therapist: ${error}`);
        }
    },

    /**
     * Notify customer about booking status
     */
    async notifyCustomer(booking: Booking, event: string): Promise<void> {
        try {
            const titles: Record<string, string> = {
                confirmed: 'Booking Confirmed! 🎉',
                cancelled: 'Booking Cancelled',
                completed: 'Service Completed'
            };

            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'notifications',
                ID.unique(),
                {
                    userId: booking.customerId,
                    type: `booking_${event}`,
                    title: titles[event] || 'Booking Update',
                    message: `Your booking with ${booking.therapistName} has been ${event}`,
                    data: JSON.stringify({ bookingId: booking.$id }),
                    isRead: false,
                    createdAt: new Date().toISOString()
                }
            );

            console.log('✅ Customer notified');
        } catch (error) {
            console.error('❌ Error notifying customer:', error);
        }
    },

    /**
     * Notify admin about important events
     */
    async notifyAdmin(booking: Booking, event: string): Promise<void> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'notifications',
                ID.unique(),
                {
                    userId: 'admin',
                    type: event,
                    title: 'Admin Alert',
                    message: `Booking ${booking.bookingId}: ${event.replace(/_/g, ' ')}`,
                    data: JSON.stringify({ bookingId: booking.$id }),
                    isRead: false,
                    createdAt: new Date().toISOString()
                }
            );

            console.log('✅ Admin notified');
        } catch (error) {
            console.error('❌ Error notifying admin:', error);
        }
    },

    /**
     * Notify alternative therapists about opportunity
     */
    async notifyAlternativeTherapists(
        alternatives: AlternativeTherapistSearchResult[],
        booking: Booking
    ): Promise<void> {
        try {
            const promises = alternatives.slice(0, 3).map(alt =>
                databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    'notifications',
                    ID.unique(),
                    {
                        userId: alt.therapistId,
                        type: 'alternative_booking',
                        title: 'Booking Opportunity',
                        message: `Customer needs massage: ${booking.duration}min on ${booking.date}`,
                        data: JSON.stringify({ bookingId: booking.$id, originalTherapistId: booking.therapistId }),
                        isRead: false,
                        createdAt: new Date().toISOString()
                    }
                )
            );

            await Promise.all(promises);
            console.log(`✅ Notified ${alternatives.length} alternative therapists`);
        } catch (error) {
            console.error('❌ Error notifying alternatives:', error);
        }
    },

    /**
     * Get bookings for therapist
     */
    async getTherapistBookings(therapistId: string): Promise<Booking[]> {
        try {
            // Skip if bookings collection is disabled
            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                return [];
            }

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('therapistId', therapistId),
                    Query.orderDesc('createdAt'),
                    Query.limit(100)
                ]
            );

            return response.documents as unknown as Booking[];
        } catch (error: any) {
            // Handle 404 gracefully
            if (error?.code === 404 || error?.message?.includes('Collection') || error?.message?.includes('could not be found')) {
                return [];
            }
            console.warn('⚠️ Therapist bookings unavailable:', error?.message || error);
            return [];
        }
    },

    /**
     * Get bookings by provider (therapist or place)
     * Used by TherapistCard and FacialPlaceCard components
     */
    async getByProvider(providerId: string, providerType: 'therapist' | 'place'): Promise<Booking[]> {
        try {
            // Skip if bookings collection is disabled
            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                return [];
            }

            const attribute = providerType === 'therapist' ? 'therapistId' : 'placeId';
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal(attribute, providerId),
                    Query.orderDesc('createdAt'),
                    Query.limit(100)
                ]
            );

            return response.documents as unknown as Booking[];
        } catch (error: any) {
            // Handle 404 gracefully
            if (error?.code === 404 || error?.message?.includes('Collection') || error?.message?.includes('could not be found')) {
                return [];
            }
            console.warn('⚠️ Provider bookings unavailable:', error?.message || error);
            return [];
        }
    },

    /**
     * Get bookings count for a provider (therapist or place)
     */
    async getBookingsCount(providerId: string, providerType: 'therapist' | 'place' = 'therapist'): Promise<number> {
        try {
            // Skip if bookings collection is disabled
            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                // Return 0 silently - collection doesn't exist yet
                return 0;
            }

            const attribute = providerType === 'therapist' ? 'therapistId' : 'placeId';
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal(attribute, providerId),
                    Query.limit(1) // We only need the count, not the documents
                ]
            );

            return response.total || 0;
        } catch (error: any) {
            // Handle 404 (collection not found) gracefully
            if (error?.code === 404 || error?.message?.includes('Collection') || error?.message?.includes('could not be found')) {
                // Collection doesn't exist - return 0 silently
                return 0;
            }
            // Log other errors but still return 0 to prevent UI breaking
            console.warn(`⚠️ Bookings count unavailable for ${providerType}:`, error?.message || error);
            return 0;
        }
    },

    /**
     * Get all bookings for admin
     */
    async getAllBookings(): Promise<Booking[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                [Query.orderDesc('createdAt'), Query.limit(500)]
            );

            return response.documents as unknown as Booking[];
        } catch (error) {
            console.error('❌ Error fetching all bookings:', error);
            return [];
        }
    },

    /**
     * Subscribe to booking updates
     */
    subscribeToBooking(bookingId: string, callback: (booking: Booking) => void): () => void {
        try {
            // Note: Real-time subscriptions need to be implemented with Appwrite Realtime
            // const unsubscribe = databases.subscribe(...)
            console.log('✅ Real-time subscription placeholder for booking:', bookingId);
            
            // Return a no-op unsubscribe function
            return () => console.log('Unsubscribed from booking:', bookingId);
        } catch (error) {
            console.error('❌ Error subscribing to booking:', error);
            return () => {};
        }
    },

    /**
     * Subscribe to all bookings for a provider (therapist/place)
     * Used by provider dashboards for real-time booking notifications
     */
    subscribeToProviderBookings(
        providerId: string,
        callback: (booking: Booking) => void
    ): () => void {
        try {
            // Import client for real-time subscription
            const { Client } = require('appwrite');
            const client = new Client()
                .setEndpoint(APPWRITE_CONFIG.endpoint)
                .setProject(APPWRITE_CONFIG.projectId);

            console.log('🔔 Setting up realtime subscription for provider:', providerId);

            // Subscribe to all bookings collection changes
            const unsubscribe = client.subscribe(
                `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.bookings || 'bookings'}.documents`,
                (response: any) => {
                    console.log('📡 Booking event received:', response.events);
                    
                    // Filter for bookings where providerId matches
                    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                        const booking = response.payload as any;
                        
                        // 🔥 CRITICAL FIX: Check both therapistId AND providerId fields
                        // Schema uses "providerId" but code sometimes uses "therapistId"
                        const bookingProviderId = booking.providerId || booking.therapistId;
                        
                        console.log('🔍 Checking booking provider:', {
                            bookingProviderId,
                            expectedProviderId: providerId,
                            match: bookingProviderId === providerId
                        });
                        
                        if (bookingProviderId === providerId) {
                            console.log('✅ New booking received for provider:', providerId);
                            callback(booking as Booking);
                        }
                    }
                }
            );

            console.log('✅ Subscribed to provider bookings:', providerId);
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error subscribing to provider bookings:', error);
            // Return a no-op function to prevent crashes
            return () => {};
        }
    }
};



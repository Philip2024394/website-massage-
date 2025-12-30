/**
 * Booking Service with Real-time Updates and Alternative Therapist Search
 * Handles booking lifecycle, status updates, and notifications
 */

import { databases, ID, Query } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { MessageSenderType } from '../types';
import * as chatService from './chatService';
import { commissionTrackingService } from './services/commissionTrackingService';

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

            const booking = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                ID.unique(),
                {
                    ...bookingData,
                    bookingId,
                    status: 'pending',
                    responseDeadline,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    alternativeSearch: false
                }
            );

            console.log('✅ Booking created:', booking.$id);

            // Chat messages will be created by the ChatWindow component
            console.log('✅ Booking ready for chat integration');

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
     * Therapist confirms booking
     */
    async confirmBooking(bookingId: string, therapistId: string): Promise<Booking> {
        try {
            const booking = await this.updateBookingStatus(bookingId, 'confirmed', {
                confirmedAt: new Date().toISOString()
            } as any);

            // Notify customer
            await this.notifyCustomer(booking, 'confirmed');

            return booking;
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
                booking.completedAt || new Date().toISOString()
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
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'notifications',
                ID.unique(),
                {
                    userId: booking.therapistId,
                    type: 'new_booking',
                    title: 'New Booking Request',
                    message: `${booking.customerName} requested ${booking.duration}min massage on ${booking.date}`,
                    data: JSON.stringify({ bookingId: booking.$id }),
                    isRead: false,
                    createdAt: new Date().toISOString()
                }
            );

            console.log('✅ Therapist notified');
        } catch (error) {
            console.error('❌ Error notifying therapist:', error);
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
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                [
                    Query.equal('therapistId', therapistId),
                    Query.orderDesc('createdAt'),
                    Query.limit(100)
                ]
            );

            return response.documents as unknown as Booking[];
        } catch (error) {
            console.error('❌ Error fetching therapist bookings:', error);
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
        } catch (error) {
            console.error(`❌ Error fetching ${providerType} bookings count:`, error);
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
    }
};

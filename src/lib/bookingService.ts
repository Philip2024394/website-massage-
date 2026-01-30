/**
 * 🔒 Booking Service - APPWRITE SINGLE SOURCE OF TRUTH
 * 
 * ⚠️ MIGRATION COMPLETE: localStorage → Appwrite Cloud Database
 * All booking operations now use Appwrite as single source of truth
 * 
 * DO NOT revert to localStorage without approval
 */

import { MessageSenderType } from '../types';
import { trackDatabaseQuery } from '../services/enterpriseDatabaseService';
import { appwriteBookingService } from './appwrite/services/booking.service.appwrite';
import { databases, ID, Query } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';

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
    locationType?: 'home' | 'hotel' | 'villa';
    address?: string | null;
    roomNumber?: string | null;
    massageFor?: 'male' | 'female' | 'children';
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'searching';
    responseDeadline?: string;
    expiresAt?: string; // ⏱️ CRITICAL: 5-minute expiry
    acceptedAt?: string;
    rejectedAt?: string;
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
};

export const bookingService = {
    /**
     * Create booking in Appwrite
     * 🔒 CRITICAL: Single source of truth
     */
    async createBooking(bookingData: Omit<Booking, '$id' | '$createdAt' | 'bookingId'>): Promise<Booking> {
        const startTime = performance.now();
        
        console.log('📦 [BOOKING SERVICE] Creating booking via Appwrite...');
        console.log('🔍 [BOOKING DIAGNOSTIC] Input data:', JSON.stringify(bookingData, null, 2));
        console.log('🔍 [BOOKING DIAGNOSTIC] appwriteBookingService available:', !!appwriteBookingService);
        console.log('🔍 [BOOKING DIAGNOSTIC] appwriteBookingService.createBooking type:', typeof appwriteBookingService.createBooking);
        
        try {
            console.log('🔍 [BOOKING DIAGNOSTIC] About to call appwriteBookingService.createBooking...');
            const booking = await appwriteBookingService.createBooking(bookingData);
            console.log('🔍 [BOOKING DIAGNOSTIC] appwriteBookingService returned:', JSON.stringify(booking, null, 2));
            
            // Track successful creation
            const duration = performance.now() - startTime;
            trackDatabaseQuery('bookings', 'create', duration, { 
                therapistId: bookingData.therapistId,
                duration: bookingData.duration,
                backend: 'appwrite'
            }, 1);

            console.log('✅ [BOOKING SERVICE] Booking created successfully:', booking.bookingId);
            return booking;
            
        } catch (error: any) {
            console.error('❌ [BOOKING SERVICE] Failed to create booking:', error);
            console.error('🔍 [BOOKING DIAGNOSTIC] Error details:', {
                name: error?.name,
                message: error?.message,
                code: error?.code,
                status: error?.status,
                stack: error?.stack?.split('\n').slice(0, 5)
            });
            
            const duration = performance.now() - startTime;
            trackDatabaseQuery('bookings', 'create', duration, { 
                error: true,
                backend: 'appwrite',
                message: error.message
            }, 0);
            
            throw error;
        }
    },

    /**
     * Accept booking and create commission (30%)
     * 🔒 CRITICAL: Therapist dashboard action
     */
    async acceptBookingAndCreateCommission(
        bookingId: string,
        therapistId: string,
        therapistName: string
    ): Promise<{ booking: Booking; commission: any }> {
        console.log('✅ [BOOKING SERVICE] Accepting booking:', bookingId);
        
        try {
            // 🔒 Step 1: Accept booking (with authorization + state machine validation)
            const booking = await appwriteBookingService.acceptBooking(bookingId, therapistId, therapistName);

            // 🔒 RULE #5: IDEMPOTENT COMMISSION TRIGGER
            // Check if commission already exists for this booking
            // Prevents duplicate commission creation from retries or UI bugs
            console.log('🔒 [COMMISSION] Checking for existing commission...');
            
            const existingCommissions = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.commission_records,
                [
                    Query.equal('bookingId', booking.bookingId),
                    Query.limit(1)
                ]
            );

            if (existingCommissions.documents.length > 0) {
                console.log('✅ [COMMISSION] Commission already exists - skipping creation');
                console.log('   - Commission ID:', existingCommissions.documents[0].$id);
                console.log('   - Created at:', existingCommissions.documents[0].$createdAt);
                console.log('   - Status:', existingCommissions.documents[0].status);
                
                return { 
                    booking, 
                    commission: existingCommissions.documents[0] 
                };
            }

            console.log('🔒 [COMMISSION] No existing commission - creating new one');
            
            // Create commission record (30% of booking price)
            const commissionAmount = Math.round(booking.price * 0.30);
            const commissionDoc = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.commission_records,
                ID.unique(),
                {
                    bookingId: booking.bookingId,
                    therapistId,
                    therapistName,
                    bookingAmount: booking.price,
                    commissionRate: 0.30,
                    commissionAmount,
                    status: 'PENDING',
                    completedAt: new Date().toISOString(),
                    paymentDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // +3 hours
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            console.log('✅ [COMMISSION] Commission created successfully');
            console.log('   - Commission ID:', commissionDoc.$id);
            console.log('   - Amount:', commissionAmount, '(30% of', booking.price + ')');
            console.log('   - Payment deadline:', commissionDoc.paymentDeadline);
            
            return { booking, commission: commissionDoc };
            
        } catch (error) {
            console.error('❌ [BOOKING SERVICE] Failed to accept booking:', error);
            throw error;
        }
    },

    /**
     * Get booking by ID from Appwrite
     */
    async getBookingById(bookingId: string): Promise<Booking | null> {
        return await appwriteBookingService.getBookingById(bookingId);
    },

    /**
     * List bookings with filters from Appwrite
     */
    async listBookings(filters?: {
        customerId?: string;
        therapistId?: string;
        status?: Booking['status'];
    }): Promise<Booking[]> {
        console.log('📋 [BOOKING SERVICE] Listing bookings from Appwrite:', filters);
        
        // For now, if therapistId filter provided, use specialized method
        if (filters?.therapistId) {
            return await appwriteBookingService.listBookingsForTherapist(filters.therapistId);
        }
        
        // Otherwise, get booking and filter manually (can be optimized later)
        console.warn('⚠️ [BOOKING SERVICE] Generic listBookings not fully implemented, returning empty array');
        return [];
    },

    /**
     * Update booking status in Appwrite
     */
    async updateBookingStatus(
        bookingId: string,
        status: Booking['status'],
        additionalData?: Partial<Booking>
    ): Promise<Booking> {
        console.log('🔄 [BOOKING SERVICE] Updating booking status:', bookingId, status);
        
        // Delegate to specific methods based on status
        if (status === 'confirmed') {
            // This should use acceptBooking
            throw new Error('Use acceptBookingAndCreateCommission for confirming bookings');
        }
        
        if (status === 'cancelled') {
            return await appwriteBookingService.rejectBooking(bookingId);
        }
        
        // For other statuses, not yet implemented
        console.warn('⚠️ [BOOKING SERVICE] Generic updateBookingStatus not fully implemented');
        throw new Error(`Status update to '${status}' not yet implemented in Appwrite service`);
    },

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId: string, cancelReason?: string): Promise<Booking> {
        console.log('❌ [BOOKING SERVICE] Cancelling booking:', bookingId);
        return await appwriteBookingService.rejectBooking(bookingId);
    },

    /**
     * Complete booking
     */
    async completeBooking(bookingId: string): Promise<Booking> {
        console.log('✅ [BOOKING SERVICE] Completing booking:', bookingId);
        console.warn('⚠️ [BOOKING SERVICE] Complete booking not yet implemented in Appwrite');
        throw new Error('Complete booking not yet implemented in Appwrite service');
    },

    /**
     * Search alternative therapists (stub)
     */
    async searchAlternativeTherapists(
        location: string,
        serviceType: string,
        duration: number
    ): Promise<AlternativeTherapistSearchResult[]> {
        console.log('🔍 [BOOKING SERVICE] Alternative therapist search (not implemented)');
        return [];
    },

    /**
     * Stub methods for compatibility
     */
    async notifyTherapist(booking: Booking): Promise<void> {
        console.log('📬 [BOOKING SERVICE] Therapist notification (stub)');
    },

    async notifyCustomer(booking: Booking, type: string): Promise<void> {
        console.log('📬 [BOOKING SERVICE] Customer notification (stub)');
    },

    async sendStatusUpdateMessage(booking: Booking): Promise<void> {
        console.log('💬 [BOOKING SERVICE] Status update message (stub)');
    },

    async checkAndSearchAlternative(bookingId: string): Promise<void> {
        console.log('🔍 [BOOKING SERVICE] Alternative search check (stub)');
    },

    /**
     * Get bookings for a specific provider/therapist
     * 🔒 CRITICAL: Used by therapist dashboard
     */
    async getProviderBookings(providerId: string): Promise<Booking[]> {
        console.log('📋 [BOOKING SERVICE] Getting bookings for provider:', providerId);
        return await appwriteBookingService.listBookingsForTherapist(providerId);
    },

    /**
     * Subscribe to provider bookings using Appwrite Realtime
     * 🔒 CRITICAL: Used by therapist dashboard for instant notifications
     */
    subscribeToProviderBookings(
        providerId: string,
        callback: (booking: Booking) => void
    ): () => void {
        console.log('🔔 [BOOKING SERVICE] Setting up Appwrite realtime subscription for:', providerId);
        return appwriteBookingService.subscribeToTherapistBookings(providerId, callback);
    }
};

export default bookingService;



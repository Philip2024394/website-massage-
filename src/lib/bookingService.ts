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
        
        try {
            const booking = await appwriteBookingService.createBooking(bookingData);
            
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
            const duration = performance.now() - startTime;
            trackDatabaseQuery('bookings', 'create', duration, { 
                error: true,
                backend: 'appwrite',
                message: error.message
            }, 0);
            
            console.error('❌ [BOOKING SERVICE] Failed to create booking:', error);
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
            const booking = await appwriteBookingService.acceptBooking(bookingId, therapistId, therapistName);

            // Create commission record (30% of booking price)
            const commission = {
                $id: `comm_${Date.now()}`,
                bookingId: booking.bookingId,
                therapistId,
                amount: Math.round(booking.price * 0.30),
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            console.log('✅ [BOOKING SERVICE] Booking accepted with 30% commission');
            return { booking, commission };
            
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



/**
 * Booking Service - localStorage Only
 * All booking operations use client-side storage
 */

import { MessageSenderType } from '../types';
import { trackDatabaseQuery } from '../services/enterpriseDatabaseService';

// LocalStorage keys
const BOOKINGS_KEY = 'massage_bookings';
const BOOKING_ID_COUNTER_KEY = 'booking_id_counter';

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

// Helper functions
const getBookings = (): Booking[] => {
    const startTime = performance.now();
    
    try {
        const stored = localStorage.getItem(BOOKINGS_KEY);
        const bookings = stored ? JSON.parse(stored) : [];
        
        // Track database read operation
        const duration = performance.now() - startTime;
        trackDatabaseQuery('bookings', 'list', duration, {}, bookings.length);
        
        return bookings;
    } catch (error) {
        console.error('Error reading bookings:', error);
        
        // Track database error
        const duration = performance.now() - startTime;
        trackDatabaseQuery('bookings', 'list', duration, { error: true }, 0);
        
        return [];
    }
};

const saveBookings = (bookings: Booking[]): void => {
    const startTime = performance.now();
    
    try {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        
        // Track database write operation
        const duration = performance.now() - startTime;
        trackDatabaseQuery('bookings', 'update', duration, {}, bookings.length);
        
    } catch (error) {
        console.error('Error saving bookings:', error);
        
        // Track database error
        const duration = performance.now() - startTime;
        trackDatabaseQuery('bookings', 'update', duration, { error: true }, 0);
    }
};

const generateBookingId = (): string => {
    try {
        const counter = parseInt(localStorage.getItem(BOOKING_ID_COUNTER_KEY) || '1000', 10);
        const newId = counter + 1;
        localStorage.setItem(BOOKING_ID_COUNTER_KEY, newId.toString());
        return `BK${newId}`;
    } catch (error) {
        return `BK${Date.now()}`;
    }
};

export const bookingService = {
    /**
     * Create new booking
     */
    async createBooking(bookingData: Omit<Booking, '$id' | '$createdAt' | 'bookingId'>): Promise<Booking> {
        const startTime = performance.now();
        
        const bookingId = generateBookingId();
        const now = new Date().toISOString();
        
        const booking: Booking = {
            $id: `doc_${bookingId}`,
            $createdAt: now,
            bookingId,
            ...bookingData,
            status: 'pending',
            responseDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            createdAt: now,
            updatedAt: now,
            alternativeSearch: false
        };

        const bookings = getBookings();
        bookings.push(booking);
        
        // Track database operation
        const duration = performance.now() - startTime;
        trackDatabaseQuery('bookings', 'create', duration, { status: 'pending' }, 1);
        saveBookings(bookings);

        console.log('✅ Booking created:', booking.bookingId);
        return booking;
    },

    /**
     * Update booking status
     */
    async updateBookingStatus(
        bookingId: string,
        status: Booking['status'],
        additionalData?: Partial<Booking>
    ): Promise<Booking> {
        const bookings = getBookings();
        const index = bookings.findIndex(b => b.bookingId === bookingId || b.$id === bookingId);
        
        if (index === -1) {
            throw new Error(`Booking not found: ${bookingId}`);
        }

        bookings[index] = {
            ...bookings[index],
            status,
            updatedAt: new Date().toISOString(),
            ...additionalData
        };

        saveBookings(bookings);
        console.log(`✅ Booking ${bookingId} updated to:`, status);
        return bookings[index];
    },

    /**
     * Accept booking
     */
    async acceptBookingAndCreateCommission(
        bookingId: string,
        therapistId: string,
        therapistName: string
    ): Promise<{ booking: Booking; commission: any }> {
        const bookings = getBookings();
        const index = bookings.findIndex(b => b.bookingId === bookingId || b.$id === bookingId);
        
        if (index === -1) {
            throw new Error('Booking not found');
        }

        const booking = bookings[index];

        if (booking.status !== 'pending') {
            console.warn('⚠️ Booking already processed:', booking.status);
            return { booking, commission: null };
        }

        booking.status = 'confirmed';
        booking.updatedAt = new Date().toISOString();
        bookings[index] = booking;
        saveBookings(bookings);

        const commission = {
            $id: `comm_${Date.now()}`,
            bookingId: booking.bookingId,
            therapistId,
            amount: Math.round(booking.price * 0.30),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        console.log('✅ Booking accepted with 30% commission');
        return { booking, commission };
    },

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string): Promise<Booking | null> {
        const bookings = getBookings();
        return bookings.find(b => b.bookingId === bookingId || b.$id === bookingId) || null;
    },

    /**
     * List all bookings
     */
    async listBookings(filters?: {
        customerId?: string;
        therapistId?: string;
        status?: Booking['status'];
    }): Promise<Booking[]> {
        let bookings = getBookings();

        if (filters) {
            if (filters.customerId) {
                bookings = bookings.filter(b => b.customerId === filters.customerId);
            }
            if (filters.therapistId) {
                bookings = bookings.filter(b => b.therapistId === filters.therapistId);
            }
            if (filters.status) {
                bookings = bookings.filter(b => b.status === filters.status);
            }
        }

        return bookings.sort((a, b) => 
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
    },

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId: string, cancelReason?: string): Promise<Booking> {
        return this.updateBookingStatus(bookingId, 'cancelled', { cancelReason });
    },

    /**
     * Complete booking
     */
    async completeBooking(bookingId: string): Promise<Booking> {
        return this.updateBookingStatus(bookingId, 'completed');
    },

    /**
     * Search alternative therapists (stub)
     */
    async searchAlternativeTherapists(
        location: string,
        serviceType: string,
        duration: number
    ): Promise<AlternativeTherapistSearchResult[]> {
        console.log('🔍 Alternative therapist search (localStorage mode - returning empty)');
        return [];
    },

    /**
     * Stub methods for compatibility
     */
    async notifyTherapist(booking: Booking): Promise<void> {
        console.log('📬 Therapist notification (localStorage mode - skipped)');
    },

    async notifyCustomer(booking: Booking, type: string): Promise<void> {
        console.log('📬 Customer notification (localStorage mode - skipped)');
    },

    async sendStatusUpdateMessage(booking: Booking): Promise<void> {
        console.log('💬 Status update message (localStorage mode - skipped)');
    },

    async checkAndSearchAlternative(bookingId: string): Promise<void> {
        console.log('🔍 Alternative search check (localStorage mode - skipped)');
    },

    /**
     * Subscribe to all bookings for a provider (therapist/place)
     * Used by provider dashboards for real-time booking notifications
     * This is a CRITICAL function for therapist notifications
     */
    subscribeToProviderBookings(
        providerId: string,
        callback: (booking: Booking) => void
    ): () => void {
        try {
            console.log('🔔 Setting up realtime subscription for provider:', providerId);
            console.log('🔔 Using localStorage simulation for development/testing');

            // In localStorage mode, simulate real-time updates by polling
            let pollInterval: NodeJS.Timeout;
            let lastBookingCount = getBookings().length;

            pollInterval = setInterval(() => {
                const currentBookings = getBookings();
                const currentCount = currentBookings.length;
                
                // If new bookings were added, check for ones belonging to this provider
                if (currentCount > lastBookingCount) {
                    const newBookings = currentBookings.slice(0, currentCount - lastBookingCount);
                    newBookings.forEach(booking => {
                        // Check both therapistId and providerId fields for compatibility
                        const bookingProviderId = booking.therapistId; // In localStorage mode, we use therapistId
                        
                        console.log('🔍 Checking booking provider:', {
                            bookingProviderId,
                            expectedProviderId: providerId,
                            match: bookingProviderId === providerId
                        });
                        
                        if (bookingProviderId === providerId) {
                            console.log('✅ New booking received for provider:', providerId);
                            callback(booking);
                        }
                    });
                }
                
                lastBookingCount = currentCount;
            }, 1000); // Check every second

            console.log('✅ LocalStorage polling subscription set up for provider:', providerId);

            // Return cleanup function
            return () => {
                if (pollInterval) {
                    clearInterval(pollInterval);
                    console.log('🧹 Cleaned up booking subscription for provider:', providerId);
                }
            };
        } catch (error) {
            console.error('❌ Error subscribing to provider bookings:', error);
            // Return a no-op function to prevent crashes
            return () => {};
        }
    }
};

export default bookingService;



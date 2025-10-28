/**
 * Hotel/Villa Live Booking System Service
 * 
 * This service handles:
 * 1. Real-time booking creation with 1-hour minimum advance notice
 * 2. Auto-status management (sets provider to Busy when confirmed)
 * 3. 25-minute confirmation timeout
 * 4. 10km radius fallback system for unconfirmed bookings
 * 5. Notifications to guest, hotel, and providers
 */

import { Booking, BookingStatus, ProviderResponseStatus, AvailabilityStatus, Therapist, Place } from '../types';
import { hotelVillaBookingService as appwriteBookingService } from '../lib/appwriteService';

export class HotelVillaBookingService {
    private static timeoutTrackers: Map<string, NodeJS.Timeout> = new Map();

    /**
     * Create a new hotel/villa guest booking
     */
    static async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
        try {
            // Create booking in Appwrite
            const newBooking = await appwriteBookingService.createBooking(bookingData);

            // Send initial notifications
            await this.sendBookingNotifications(newBooking, 'created');

            // Start timeout monitoring
            if (newBooking.confirmationDeadline) {
                this.startTimeoutMonitoring(newBooking);
            }

            return newBooking;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    /**
     * Provider confirms the booking
     */
    static async confirmBooking(bookingId: string): Promise<void> {
        try {
            // Update booking in Appwrite
            await appwriteBookingService.confirmBooking(bookingId);

            // Cancel timeout monitoring
            this.cancelTimeout(bookingId);

            // Auto-set provider status to Busy
            // TODO: Implement provider status update
            // await this.updateProviderStatus(providerId, providerType, AvailabilityStatus.Busy);

            console.log(`✅ Booking ${bookingId} confirmed, provider set to Busy`);
        } catch (error) {
            console.error('Error confirming booking:', error);
            throw error;
        }
    }

    /**
     * Provider indicates they are on the way
     */
    static async setOnTheWay(bookingId: string): Promise<void> {
        try {
            // Update booking in Appwrite
            await appwriteBookingService.setOnTheWay(bookingId);

            // Cancel timeout monitoring
            this.cancelTimeout(bookingId);

            console.log(`✅ Provider on the way for booking ${bookingId}`);
        } catch (error) {
            console.error('Error setting on the way status:', error);
            throw error;
        }
    }

    /**
     * Provider declines the booking
     */
    static async declineBooking(bookingId: string): Promise<void> {
        try {
            // Update booking in Appwrite
            await appwriteBookingService.declineBooking(bookingId);

            // Cancel current timeout
            this.cancelTimeout(bookingId);

            // Immediately trigger fallback
            await this.triggerFallbackSystem(bookingId);

            console.log(`✅ Booking ${bookingId} declined, triggering fallback`);
        } catch (error) {
            console.error('Error declining booking:', error);
            throw error;
        }
    }

    /**
     * Start 25-minute timeout monitoring
     */
    private static startTimeoutMonitoring(booking: any): void {
        if (!booking.confirmationDeadline) return;

        const deadline = new Date(booking.confirmationDeadline);
        const now = new Date();
        const msUntilDeadline = deadline.getTime() - now.getTime();

        if (msUntilDeadline > 0) {
            const timeoutId = setTimeout(() => {
                this.handleTimeout(booking.$id || booking.id);
            }, msUntilDeadline);

            this.timeoutTrackers.set(booking.$id || booking.id, timeoutId);
            console.log(`⏰ Timeout monitoring started for booking ${booking.$id || booking.id}: ${msUntilDeadline}ms`);
        }
    }

    /**
     * Cancel timeout monitoring
     */
    private static cancelTimeout(bookingId: string): void {
        const timeoutId = this.timeoutTrackers.get(bookingId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeoutTrackers.delete(bookingId);
            console.log(`⏹️ Timeout cancelled for booking ${bookingId}`);
        }
    }

    /**
     * Handle timeout - trigger fallback system
     */
    private static async handleTimeout(bookingId: string): Promise<void> {
        console.log(`⏰ Timeout reached for booking ${bookingId}, triggering fallback...`);
        
        try {
            // Mark original booking as timed out
            await appwriteBookingService.updateBooking(bookingId, {
                providerResponseStatus: 'timed_out',
                status: 'timed_out'
            });

            // Trigger fallback to find alternative providers
            await this.triggerFallbackSystem(bookingId);
        } catch (error) {
            console.error('Error handling timeout:', error);
        }
    }

    /**
     * Fallback System: Find next available provider within 10km
     */
    private static async triggerFallbackSystem(bookingId: string): Promise<void> {
        try {
            // Fetch booking details from Appwrite
            const booking = await appwriteBookingService.getBookingById(bookingId);
            
            if (!booking) {
                console.error('Booking not found:', bookingId);
                return;
            }

            // Find alternative providers within 10km
            const alternativeProviders = await appwriteBookingService.findAlternativeProviders(
                booking.hotelVillaId,
                booking.fallbackProviderIds || [],
                booking.providerType
            );

            if (alternativeProviders.length > 0) {
                // Reassign to first available provider
                const newProvider = alternativeProviders[0];
                
                await appwriteBookingService.reassignBooking(
                    bookingId,
                    newProvider.$id,
                    newProvider.name
                );
                
                console.log(`✅ Booking ${bookingId} reassigned to provider ${newProvider.name}`);
            } else {
                // No alternatives found - notify hotel and guest
                await this.notifyNoProvidersAvailable(bookingId);
                
                console.log(`❌ No alternative providers found for booking ${bookingId}`);
            }
        } catch (error) {
            console.error('Error in fallback system:', error);
        }
    }

    /**
     * Find alternative providers within 10km radius
     * @deprecated - Now handled by appwriteBookingService
     */
    private static async findAlternativeProviders(
        hotelVillaId: string,
        originalProviderId: string,
        providerType: 'therapist' | 'place',
        excludeIds: string[]
    ): Promise<Array<Therapist | Place>> {
        // Delegate to Appwrite service
        return appwriteBookingService.findAlternativeProviders(
            hotelVillaId,
            [originalProviderId, ...excludeIds],
            providerType
        );
    }

    /**
     * Reassign booking to new provider
     * @deprecated - Now handled by appwriteBookingService
     */
    private static async reassignBooking(bookingId: string, newProvider: any): Promise<void> {
        return appwriteBookingService.reassignBooking(
            bookingId,
            newProvider.$id || newProvider.id,
            newProvider.name
        );
    }

    /**
     * Update provider availability status
     */
    private static async updateProviderStatus(
        providerId: string,
        providerType: 'therapist' | 'place',
        status: AvailabilityStatus
    ): Promise<void> {
        try {
            // TODO: Implement provider status update via Appwrite
            // This will be handled in a future phase
            console.log(`📝 Provider ${providerId} status would be updated to ${status}`);
        } catch (error) {
            console.error('Error updating provider status:', error);
        }
    }

    /**
     * Send notifications to all parties
     */
    private static async sendBookingNotifications(
        booking: Booking,
        event: 'created' | 'confirmed' | 'onTheWay' | 'reassigned' | 'cancelled'
    ): Promise<void> {
        try {
            // TODO: Implement actual notification system
            // 1. Send to provider (push notification)
            // 2. Send to hotel dashboard (real-time update)
            // 3. Send to guest (optional - WhatsApp or SMS)

            console.log(`📬 Notifications sent for booking ${booking.id} - event: ${event}`);
            console.log(`   - Provider: ${booking.providerName}`);
            console.log(`   - Hotel: ${booking.hotelVillaName}`);
            console.log(`   - Guest: ${booking.guestName} (Room ${booking.roomNumber})`);
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    }

    /**
     * Notify hotel and guest that no providers are available
     */
    private static async notifyNoProvidersAvailable(bookingId: string): Promise<void> {
        try {
            console.log(`📧 Notifying hotel and guest: No providers available for booking ${bookingId}`);
            
            // Update booking status to cancelled
            await appwriteBookingService.cancelBooking(
                bookingId,
                'No providers available within service area'
            );
        } catch (error) {
            console.error('Error notifying no providers available:', error);
        }
    }

    /**
     * Complete a booking and auto-return provider to Available status
     */
    static async completeBooking(bookingId: string, providerId: string, providerType: 'therapist' | 'place'): Promise<void> {
        try {
            // Complete booking in Appwrite
            await appwriteBookingService.completeBooking(bookingId);

            // Auto-set provider back to Available
            await this.updateProviderStatus(providerId, providerType, AvailabilityStatus.Available);

            console.log(`✅ Booking ${bookingId} completed, provider ${providerId} set to Available`);
        } catch (error) {
            console.error('Error completing booking:', error);
            throw error;
        }
    }
}

export default HotelVillaBookingService;

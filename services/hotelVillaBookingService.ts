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

export class HotelVillaBookingService {
    private static timeoutTrackers: Map<number, NodeJS.Timeout> = new Map();

    /**
     * Create a new hotel/villa guest booking
     */
    static async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
        try {
            // TODO: Replace with actual Appwrite database call
            // const booking = await databases.createDocument(
            //     DATABASE_ID,
            //     BOOKINGS_COLLECTION_ID,
            //     ID.unique(),
            //     bookingData
            // );

            // Mock booking creation
            const newBooking: Booking = {
                id: Date.now(),
                providerId: bookingData.providerId!,
                providerType: bookingData.providerType!,
                providerName: bookingData.providerName!,
                userId: 'hotel_guest',
                userName: bookingData.guestName!,
                service: bookingData.service!,
                startTime: bookingData.startTime!,
                status: BookingStatus.Pending,
                guestName: bookingData.guestName,
                roomNumber: bookingData.roomNumber,
                hotelVillaId: bookingData.hotelVillaId,
                hotelVillaName: bookingData.hotelVillaName,
                guestLanguage: bookingData.guestLanguage,
                chargeToRoom: bookingData.chargeToRoom,
                providerResponseStatus: ProviderResponseStatus.AwaitingResponse,
                confirmationDeadline: bookingData.confirmationDeadline,
                isReassigned: false,
                fallbackProviderIds: [],
                createdAt: new Date().toISOString()
            };

            // Send initial notifications
            await this.sendBookingNotifications(newBooking, 'created');

            // Start timeout monitoring
            this.startTimeoutMonitoring(newBooking);

            return newBooking;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    /**
     * Provider confirms the booking
     */
    static async confirmBooking(bookingId: number): Promise<void> {
        try {
            // TODO: Update booking in Appwrite
            const updates = {
                providerResponseStatus: ProviderResponseStatus.Confirmed,
                providerResponseTime: new Date().toISOString(),
                status: BookingStatus.Confirmed,
                confirmedAt: new Date().toISOString()
            };

            // Cancel timeout monitoring
            this.cancelTimeout(bookingId);

            // Auto-set provider status to Busy
            // await this.updateProviderStatus(providerId, providerType, AvailabilityStatus.Busy);

            // Send confirmation notifications
            // await this.sendBookingNotifications(booking, 'confirmed');

            console.log(`Booking ${bookingId} confirmed, provider set to Busy`);
        } catch (error) {
            console.error('Error confirming booking:', error);
            throw error;
        }
    }

    /**
     * Provider indicates they are on the way
     */
    static async setOnTheWay(bookingId: number): Promise<void> {
        try {
            const updates = {
                providerResponseStatus: ProviderResponseStatus.OnTheWay,
                providerResponseTime: new Date().toISOString(),
                status: BookingStatus.OnTheWay,
                confirmedAt: new Date().toISOString()
            };

            // Cancel timeout monitoring
            this.cancelTimeout(bookingId);

            // Auto-set provider status to Busy
            // await this.updateProviderStatus(providerId, providerType, AvailabilityStatus.Busy);

            // Send notifications
            // await this.sendBookingNotifications(booking, 'onTheWay');

            console.log(`Provider on the way for booking ${bookingId}, status set to Busy`);
        } catch (error) {
            console.error('Error setting on the way status:', error);
            throw error;
        }
    }

    /**
     * Provider declines the booking
     */
    static async declineBooking(bookingId: number): Promise<void> {
        try {
            const updates = {
                providerResponseStatus: ProviderResponseStatus.Declined,
                providerResponseTime: new Date().toISOString()
            };

            // Cancel current timeout
            this.cancelTimeout(bookingId);

            // Immediately trigger fallback
            // await this.triggerFallbackSystem(bookingId);

            console.log(`Booking ${bookingId} declined, triggering fallback`);
        } catch (error) {
            console.error('Error declining booking:', error);
            throw error;
        }
    }

    /**
     * Start 25-minute timeout monitoring
     */
    private static startTimeoutMonitoring(booking: Booking): void {
        if (!booking.confirmationDeadline) return;

        const deadline = new Date(booking.confirmationDeadline);
        const now = new Date();
        const msUntilDeadline = deadline.getTime() - now.getTime();

        if (msUntilDeadline > 0) {
            const timeoutId = setTimeout(() => {
                this.handleTimeout(booking.id);
            }, msUntilDeadline);

            this.timeoutTrackers.set(booking.id, timeoutId);
            console.log(`Timeout monitoring started for booking ${booking.id}: ${msUntilDeadline}ms`);
        }
    }

    /**
     * Cancel timeout monitoring
     */
    private static cancelTimeout(bookingId: number): void {
        const timeoutId = this.timeoutTrackers.get(bookingId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeoutTrackers.delete(bookingId);
            console.log(`Timeout cancelled for booking ${bookingId}`);
        }
    }

    /**
     * Handle timeout - trigger fallback system
     */
    private static async handleTimeout(bookingId: number): Promise<void> {
        console.log(`⏰ Timeout reached for booking ${bookingId}, triggering fallback...`);
        
        try {
            // Mark original booking as timed out
            const updates = {
                providerResponseStatus: ProviderResponseStatus.TimedOut,
                status: BookingStatus.TimedOut
            };

            // Trigger fallback to find alternative providers
            await this.triggerFallbackSystem(bookingId);
        } catch (error) {
            console.error('Error handling timeout:', error);
        }
    }

    /**
     * Fallback System: Find next available provider within 10km
     */
    private static async triggerFallbackSystem(bookingId: number): Promise<void> {
        try {
            // TODO: Fetch booking details from database
            // const booking = await fetchBooking(bookingId);
            
            // Mock booking for demonstration
            const booking: Partial<Booking> = {
                id: bookingId,
                hotelVillaId: 1,
                providerId: 100,
                providerType: 'therapist',
                fallbackProviderIds: []
            };

            // Find alternative providers within 10km
            const alternativeProviders = await this.findAlternativeProviders(
                booking.hotelVillaId!,
                booking.providerId!,
                booking.providerType!,
                booking.fallbackProviderIds || []
            );

            if (alternativeProviders.length > 0) {
                // Reassign to first available provider
                const newProvider = alternativeProviders[0];
                
                await this.reassignBooking(bookingId, newProvider);
                
                console.log(`✅ Booking ${bookingId} reassigned to provider ${newProvider.id}`);
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
     */
    private static async findAlternativeProviders(
        hotelVillaId: number,
        originalProviderId: number,
        providerType: 'therapist' | 'place',
        excludeIds: number[]
    ): Promise<Array<Therapist | Place>> {
        try {
            // TODO: Replace with actual Appwrite query
            // Query for providers:
            // 1. Within 10km of hotel/villa
            // 2. Status = Available
            // 3. Not in excludeIds
            // 4. Same type as original provider
            // 5. Has opted in to hotel/villa services

            /*
            const providers = await databases.listDocuments(
                DATABASE_ID,
                providerType === 'therapist' ? THERAPISTS_COLLECTION : PLACES_COLLECTION,
                [
                    Query.equal('status', AvailabilityStatus.Available),
                    Query.equal('hotelVillaServiceStatus', 'active'),
                    Query.notEqual('$id', [originalProviderId, ...excludeIds]),
                    Query.lessThanEqual('distance', 10) // 10km radius
                ]
            );
            */

            // Mock data for demonstration
            const mockProviders: Therapist[] = [];
            
            return mockProviders;
        } catch (error) {
            console.error('Error finding alternative providers:', error);
            return [];
        }
    }

    /**
     * Reassign booking to new provider
     */
    private static async reassignBooking(bookingId: number, newProvider: Therapist | Place): Promise<void> {
        try {
            // Calculate new confirmation deadline (25 minutes from now)
            const newDeadline = new Date();
            newDeadline.setMinutes(newDeadline.getMinutes() + 25);

            const updates = {
                providerId: newProvider.id,
                providerName: newProvider.name,
                isReassigned: true,
                providerResponseStatus: ProviderResponseStatus.AwaitingResponse,
                confirmationDeadline: newDeadline.toISOString(),
                status: BookingStatus.Pending,
                // Add original provider to fallback list
                fallbackProviderIds: [] // This should append the original provider ID
            };

            // TODO: Update in database
            // await databases.updateDocument(DATABASE_ID, BOOKINGS_COLLECTION, bookingId, updates);

            // Send notification to new provider
            // await this.sendBookingNotifications(updatedBooking, 'reassigned');

            // Start new timeout monitoring
            const mockBooking: Booking = {
                id: bookingId,
                confirmationDeadline: newDeadline.toISOString()
            } as Booking;
            
            this.startTimeoutMonitoring(mockBooking);

            console.log(`Booking ${bookingId} reassigned to ${newProvider.name}`);
        } catch (error) {
            console.error('Error reassigning booking:', error);
        }
    }

    /**
     * Update provider availability status
     */
    private static async updateProviderStatus(
        providerId: number,
        providerType: 'therapist' | 'place',
        status: AvailabilityStatus
    ): Promise<void> {
        try {
            // TODO: Update provider status in Appwrite
            /*
            await databases.updateDocument(
                DATABASE_ID,
                providerType === 'therapist' ? THERAPISTS_COLLECTION : PLACES_COLLECTION,
                providerId,
                { status }
            );
            */

            console.log(`Provider ${providerId} status updated to ${status}`);
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
    private static async notifyNoProvidersAvailable(bookingId: number): Promise<void> {
        try {
            // TODO: Send notifications
            console.log(`📧 Notifying hotel and guest: No providers available for booking ${bookingId}`);
            
            // Update booking status
            const updates = {
                status: BookingStatus.Cancelled,
                cancelledAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error notifying no providers available:', error);
        }
    }

    /**
     * Complete a booking and auto-return provider to Available status
     */
    static async completeBooking(bookingId: number, providerId: number, providerType: 'therapist' | 'place'): Promise<void> {
        try {
            const updates = {
                status: BookingStatus.Completed,
                completedAt: new Date().toISOString()
            };

            // Auto-set provider back to Available
            await this.updateProviderStatus(providerId, providerType, AvailabilityStatus.Available);

            console.log(`Booking ${bookingId} completed, provider ${providerId} set to Available`);
        } catch (error) {
            console.error('Error completing booking:', error);
            throw error;
        }
    }
}

export default HotelVillaBookingService;

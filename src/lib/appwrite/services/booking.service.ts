/**
 * Booking operations and management
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';
import { validateBookingCreation, logAuthViolation } from '../../guards/bookingAuthGuards';
import { commissionTrackingService } from '../../services/commissionTrackingService';

// Import services with proper fallbacks
let notificationService: any;
let paymentService: any;
try {
    ({ notificationService } = require('../config'));
} catch {
    notificationService = { create: () => console.warn('notificationService not available') };
}
try {
    ({ paymentService } = require('../config'));
} catch {
    paymentService = { createPayment: () => console.warn('paymentService not available') };
}

export const bookingService = {
    /**
     * Validate booking time - must be at least 1 hour from now
     */
    validateBookingTime(startTime: string): { valid: boolean; message?: string } {
        try {
            const bookingTime = new Date(startTime);
            const now = new Date();
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

            if (bookingTime < oneHourFromNow) {
                return {
                    valid: false,
                    message: 'Bookings require minimum 1 hour advance notice for preparation and travel time'
                };
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                message: 'Invalid booking time format'
            };
        }
    },

    async create(booking: {
        providerId: string;  // Changed to string to match Appwrite
        providerType: 'therapist' | 'place';
        providerName: string;
        userId?: string;
        userName?: string;
        service: '60' | '90' | '120';
        startTime: string;
        bookingDate?: string; // Optional explicit booking date
        duration?: number;  // Duration in minutes
        totalCost?: number;
        paymentMethod?: string;
        hotelId?: string;
        hotelGuestName?: string;
        hotelRoomNumber?: string;
    }): Promise<any> {
        try {
            // 🔒 CRITICAL: Authorization check BEFORE booking creation
            console.log('🔒 Validating booking authorization...', {
                providerId: booking.providerId,
                providerType: booking.providerType,
                userId: booking.userId
            });

            const authCheck = await validateBookingCreation(
                booking.userId,
                booking.providerId,
                booking.providerType
            );

            if (!authCheck.allowed) {
                console.error('❌ Booking authorization FAILED:', authCheck.reason);
                
                // Log violation to audit trail
                if (booking.userId) {
                    await logAuthViolation(
                        'BOOKING_BLOCKED',
                        booking.userId,
                        authCheck.reason || 'Authorization failed',
                        {
                            providerId: booking.providerId,
                            providerType: booking.providerType,
                            service: booking.service
                        },
                        authCheck.severity || 'error'
                    );
                }

                throw new Error(authCheck.reason || 'Booking not allowed');
            }

            console.log('✅ Booking authorization PASSED');

            // Validate 1-hour minimum if startTime is provided
            if (booking.startTime && booking.bookingDate) {
                const bookingDateTime = `${booking.bookingDate}T${booking.startTime}`;
                const validation = this.validateBookingTime(bookingDateTime);
                if (!validation.valid) {
                    throw new Error(validation.message);
                }
            }

            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                console.warn('⚠️ Bookings collection disabled - simulating booking creation');
                const mockBooking = {
                    $id: `mock_booking_${Date.now()}`,
                    bookingId: `mock_booking_${Date.now()}`,
                    bookingDate: booking.bookingDate || new Date().toISOString(),
                    providerId: booking.providerId,
                    providerType: booking.providerType,
                    providerName: booking.providerName,
                    service: booking.service,
                    startTime: booking.startTime,
                    userId: booking.userId || null,
                    userName: booking.userName || null,
                    hotelId: booking.hotelId || null,
                    hotelGuestName: booking.hotelGuestName || null,
                    hotelRoomNumber: booking.hotelRoomNumber || null,
                    status: 'Pending',
                    duration: booking.duration || parseInt(booking.service),
                    totalCost: booking.totalCost || 0,
                    paymentMethod: booking.paymentMethod || 'Unpaid',
                    price: Math.round((booking.totalCost || 0) / 1000), // Add required price field
                    createdAt: new Date().toISOString(), // Add required createdAt field
                    oneHourNotice: true // Flag indicating 1-hour requirement acknowledged
                };
                console.log('✅ Mock booking created:', mockBooking.$id);
                return mockBooking;
            }
            
            const bookingId = ID.unique();
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                {
                    bookingId: bookingId,
                    bookingDate: booking.bookingDate || new Date().toISOString(),
                    providerId: booking.providerId,
                    providerType: booking.providerType,
                    providerName: booking.providerName,
                    service: booking.service,
                    startTime: booking.startTime,
                    userId: booking.userId || null,
                    userName: booking.userName || null,
                    hotelId: booking.hotelId || null,
                    hotelGuestName: booking.hotelGuestName || null,
                    hotelRoomNumber: booking.hotelRoomNumber || null,
                    status: 'Pending',
                    duration: booking.duration || parseInt(booking.service),
                    totalCost: booking.totalCost || 0,
                    paymentMethod: booking.paymentMethod || 'Unpaid',
                    price: Math.round((booking.totalCost || 0) / 1000), // Add required price field (in K format)
                    createdAt: new Date().toISOString(), // Add required createdAt field
                    responseDeadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minute response deadline
                    oneHourNotice: true, // Customer acknowledged 1-hour requirement
                    source: 'platform' // Mark as platform booking
                }
            );
            console.log('✅ Booking created successfully:', response.$id);
            console.log('⏰ 1-hour minimum requirement enforced');
            
            // Create notification for provider
            await notificationService.create({
                providerId: parseInt(booking.providerId),
                message: `New booking request from ${booking.userName || booking.hotelGuestName || 'Guest'} for ${booking.service} minutes. Customer has been notified of 1-hour minimum preparation time.`,
                type: 'booking_request',
                bookingId: response.$id
            });

            // Create payment record for therapist earnings
            if (booking.providerType === 'therapist' && booking.totalCost) {
                try {
                    await paymentService.createPayment({
                        bookingId: response.$id,
                        therapistId: booking.providerId,
                        customerName: booking.userName || booking.hotelGuestName || 'Guest',
                        amount: booking.totalCost,
                        serviceDuration: booking.service,
                        paymentMethod: booking.paymentMethod
                    });
                    console.log('✅ Payment record created for therapist');
                } catch (paymentError) {
                    console.error('⚠️ Failed to create payment record:', paymentError);
                    // Don't throw - booking was successful, payment tracking failed
                }

                // ✅ AUDIT FIX: Commission tracking for Pro members
                try {
                    // Check if therapist is Pro member (has membershipLevel === 'Pro')
                    // For now, create commission record for ALL therapist bookings
                    // TODO: Add membership check when therapist schema includes membershipLevel field
                    const { commissionTrackingService } = await import('../../services/commissionTrackingService');
                    
                    await commissionTrackingService.createCommissionRecord(
                        booking.providerId,
                        booking.providerName,
                        response.$id,
                        response.createdAt || new Date().toISOString(),
                        booking.startTime, // scheduledDate
                        booking.totalCost
                    );
                    console.log('✅ Commission record created (30% tracked)');
                } catch (commissionError) {
                    console.error('⚠️ Failed to create commission record:', commissionError);
                    // Don't throw - booking successful, commission tracking is supplementary
                }
            }
            
            return response;
        } catch (error) {
            console.error('❌ Error creating booking:', error);
            throw error;
        }
    },

    async getById(bookingId: string): Promise<any> {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId
            );
            return response;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    async getAll(): Promise<any[]> {
        try {
            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                console.warn('⚠️ Bookings collection disabled - returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(1000)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            return [];
        }
    },

    async getByUser(userId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return [];
        }
    },

    async getByProvider(providerId: string, providerType: 'therapist' | 'place'): Promise<any[]> {
        try {
            // Skip if bookings collection is disabled
            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                return [];
            }

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('providerType', providerType),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error: any) {
            // Handle 404/400 gracefully - collection might not exist or schema mismatch
            if (error?.code === 404 || error?.code === 400 || error?.message?.includes('Collection') || error?.message?.includes('could not be found')) {
                console.warn(`⚠️ Bookings unavailable for ${providerType} ${providerId} - collection may not be configured`);
                return [];
            }
            console.error('Error fetching provider bookings:', error);
            return [];
        }
    },

    async updateStatus(
        bookingId: string,
        status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled',
        assignedTherapistId?: string
    ): Promise<any> {
        try {
            const nowIso = new Date().toISOString();
            const update: any = { status };
            if (status === 'Confirmed') {
                update.confirmedAt = nowIso;
                update.providerResponseStatus = 'Confirmed';
                if (assignedTherapistId) update.assigned_therapist = assignedTherapistId;
            } else if (status === 'Completed') {
                update.completedAt = nowIso;
            } else if (status === 'Cancelled') {
                update.cancelledAt = nowIso;
                update.providerResponseStatus = 'Declined';
            }

            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                update
            );
            console.log(`✅ Booking ${bookingId} status updated to ${status}`);

            if (status === 'Completed' && response.providerType === 'therapist') {
                console.log('💰 Creating commission record for completed booking');
                try {
                    await commissionTrackingService.createCommissionRecord(
                        response.providerId,
                        response.providerName,
                        bookingId,
                        nowIso, // bookingDate = completion time
                        undefined, // no scheduled date for immediate
                        response.totalCost || 0
                    );
                    console.log('✅ Commission record created successfully');
                } catch (commissionError) {
                    console.error('❌ CRITICAL: Failed to create commission record:', commissionError);
                    // Don't throw - booking completion shouldn't fail if commission creation fails
                    // But log this as critical for manual review
                }
            }

            // Fire analytics only on Confirmed and Completed
            if (status === 'Confirmed' || status === 'Completed') {
                try {
                    // Analytics tracking with proper variables
                    const providerType = response.providerType as 'therapist' | 'place';
                    const providerId = response.providerId;
                    const amount = response.totalCost || 0;
                    
                    // Temporarily disable analytics import
                    // const { analyticsService } = await import('../services/analyticsService');
                    console.log('📊 Analytics tracking would be fired here for booking status:', status);
                    /*
                    if (status === 'Confirmed') {
                        await analyticsService.trackBookingCompleted(
                            Date.now(), // local synthetic booking id for event; persisted $id may be string
                            providerId,
                            providerType,
                            amount,
                            response.userId || undefined
                        );
                    }
                    if (status === 'Completed' && amount > 0) {
                        await analyticsService.trackRevenue(providerId, providerType, amount);
                    }
                    */

                    // Increment provider's bookings counter in analytics JSON
                    try {
                        const collectionId = providerType === 'therapist' 
                            ? APPWRITE_CONFIG.collections.therapists 
                            : APPWRITE_CONFIG.collections.places;
                        if (collectionId) {
                            const providerDoc = await databases.getDocument(
                                APPWRITE_CONFIG.databaseId,
                                collectionId,
                                providerId.toString()
                            );
                            let analyticsObj: any = {};
                            try {
                                if (providerDoc.analytics) {
                                    analyticsObj = JSON.parse(providerDoc.analytics);
                                }
                            } catch { analyticsObj = {}; }
                            const currentBookings = typeof analyticsObj.bookings === 'number' ? analyticsObj.bookings : 0;
                            analyticsObj.bookings = currentBookings + 1;
                            const updatedAnalytics = JSON.stringify(analyticsObj);
                            await databases.updateDocument(
                                APPWRITE_CONFIG.databaseId,
                                collectionId,
                                providerId.toString(),
                                { analytics: updatedAnalytics }
                            );
                            console.log(`📈 Incremented bookings for provider ${providerId} (${providerType}) to ${analyticsObj.bookings}`);
                        }
                    } catch (incErr) {
                        console.warn('⚠️ Failed to increment provider bookings count:', (incErr as any)?.message);
                    }
                } catch (e) {
                    console.warn('⚠️ Analytics tracking failed for booking status transition:', (e as any)?.message);
                }
            }
            return response;
        } catch (error) {
            console.error(`Error updating booking status to ${status}:`, error);
            throw error;
        }
    },

    async confirm(bookingId: string): Promise<any> {
        return this.updateStatus(bookingId, 'Confirmed');
    },

    async complete(bookingId: string): Promise<any> {
        return this.updateStatus(bookingId, 'Completed');
    },

    async decline(bookingId: string, reason?: string): Promise<any> {
        // Reuse cancel logic but mark providerResponseStatus
        try {
            const nowIso = new Date().toISOString();
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                {
                    status: 'Cancelled',
                    cancelledAt: nowIso,
                    providerResponseStatus: 'Declined',
                    cancellationReason: reason || null
                }
            );
            console.log(`✅ Booking ${bookingId} declined${reason ? ' (' + reason + ')' : ''}`);
            return response;
        } catch (error) {
            console.error('Error declining booking:', error);
            throw error;
        }
    },

    async updatePayment(
        bookingId: string,
        paymentMethod: string,
        totalCost: number
    ): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                {
                    paymentMethod,
                    totalCost
                }
            );
            console.log(`✅ Booking ${bookingId} payment updated`);
            return response;
        } catch (error) {
            console.error('Error updating booking payment:', error);
            throw error;
        }
    },

    async getPending(providerId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('status', 'Pending')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching pending bookings:', error);
            return [];
        }
    },

    async getByHotel(hotelId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('hotelId', hotelId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching hotel bookings:', error);
            return [];
        }
    },

    async delete(bookingId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId
            );
            console.log('✅ Booking deleted:', bookingId);
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },

    async cancel(bookingId: string, reason?: string): Promise<void> {
        try {
            const nowIso = new Date().toISOString();
            try {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.bookings,
                    bookingId,
                    {
                        status: 'Cancelled',
                        cancelledAt: nowIso,
                        // Attempt to persist reason if attribute exists
                        cancellationReason: reason || null
                    }
                );
            } catch (updateErr) {
                console.warn('⚠️ Full cancel update failed, retrying without reason:', (updateErr as any)?.message);
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.bookings,
                    bookingId,
                    {
                        status: 'Cancelled',
                        cancelledAt: nowIso
                    }
                );
            }

            try {
                await notificationService.create({
                    type: 'booking_cancelled',
                    message: `Booking ${bookingId} was cancelled${reason ? `: ${reason}` : ''}.`,
                    bookingId
                });
            } catch (notifyErr) {
                console.warn('⚠️ Failed to send cancellation notification:', (notifyErr as any)?.message);
            }

            console.log('✅ Booking cancelled:', bookingId);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
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
    }
};

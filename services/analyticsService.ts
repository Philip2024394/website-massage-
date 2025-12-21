/**
 * Analytics Service - Complete Event Tracking & Metrics System
 * 
 * Tracks all user interactions, provider performance, and platform success metrics
 * Integrates with Appwrite for real-time data storage and aggregation
 */

import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum AnalyticsEventType {
    // Profile Events
    PROFILE_VIEW = 'profile_view',
    PROFILE_IMPRESSION = 'profile_impression',
    
    // Interaction Events
    WHATSAPP_CLICK = 'whatsapp_click',
    QR_SCAN = 'qr_scan',
    BOOKING_INITIATED = 'booking_initiated',
    BOOKING_COMPLETED = 'booking_completed',
    BOOKING_CANCELLED = 'booking_cancelled',
    
    // Search Events
    SEARCH_PERFORMED = 'search_performed',
    FILTER_APPLIED = 'filter_applied',
    
    // User Events
    USER_SIGNUP = 'user_signup',
    USER_LOGIN = 'user_login',
    
    // Provider Events
    PROVIDER_REGISTRATION = 'provider_registration',
    PROVIDER_GOES_LIVE = 'provider_goes_live',
    PROVIDER_STATUS_CHANGE = 'provider_status_change',
    
    // Hotel/Villa Events
    HOTEL_MENU_VIEW = 'hotel_menu_view',
    VILLA_MENU_VIEW = 'villa_menu_view',
    GUEST_FEEDBACK_SUBMITTED = 'guest_feedback_submitted',
    
    // Commission Events
    COMMISSION_PAYMENT_UPLOADED = 'commission_payment_uploaded',
    COMMISSION_PAYMENT_VERIFIED = 'commission_payment_verified',
    
    // Revenue Events
    REVENUE_GENERATED = 'revenue_generated',
    COMMISSION_EARNED = 'commission_earned'
}

export interface AnalyticsEvent {
    id?: string;
    eventType: AnalyticsEventType;
    timestamp: string;
    
    // Entity References
    userId?: string;
    therapistId?: number | string;
    placeId?: number | string;
    hotelId?: number | string;
    villaId?: number | string;
    bookingId?: number;
    
    // Event Metadata
    metadata?: Record<string, any>;
    
    // Tracking Data
    sessionId?: string;
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    userAgent?: string;
    location?: string;
    
    // Financial Data
    amount?: number;
    currency?: string;
}

export interface TherapistAnalytics {
    therapistId: number | string;
    therapistName: string;
    
    // View Metrics
    totalImpressions: number;
    totalProfileViews: number;
    totalWhatsappClicks: number;
    
    // Booking Metrics
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    
    // Financial Metrics
    totalRevenue: number;
    averageBookingValue: number;
    
    // Performance Metrics
    conversionRate: number; // (completedBookings / totalProfileViews) * 100
    rating: number;
    reviewCount: number;
    
    // Time Metrics
    averageResponseTime?: number;
    peakHours: string[];
    
    // Period
    periodStart: string;
    periodEnd: string;
}

export interface PlaceAnalytics {
    placeId: number | string;
    placeName: string;
    
    // View Metrics
    totalImpressions: number;
    totalProfileViews: number;
    totalWhatsappClicks: number;
    
    // Booking Metrics
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    
    // Financial Metrics
    totalRevenue: number;
    averageBookingValue: number;
    
    // Performance Metrics
    conversionRate: number;
    rating: number;
    reviewCount: number;
    
    // Period
    periodStart: string;
    periodEnd: string;
}

export interface HotelVillaAnalytics {
    hotelVillaId: number | string;
    name: string;
    type: 'hotel' | 'villa';
    
    // QR & Menu Metrics
    totalQRScans: number;
    uniqueGuestViews: number;
    menuViews: number;
    
    // Booking Metrics
    totalBookings: number;
    completedBookings: number;
    
    // Provider Metrics
    uniqueProvidersViewed: number;
    topProviders: Array<{
        providerId: number;
        providerName: string;
        providerType: 'therapist' | 'place';
        bookingCount: number;
    }>;
    
    // Commission Metrics
    totalCommissionEarned: number;
    pendingCommissions: number;
    verifiedCommissions: number;
    
    // Guest Metrics
    averageGuestRating: number;
    totalFeedbacks: number;
    
    // Time Metrics
    peakHours: string[];
    
    // Period
    periodStart: string;
    periodEnd: string;
}

export interface PlatformAnalytics {
    // User Metrics
    totalUsers: number;
    activeUsers: number;
    newUsersThisPeriod: number;
    
    // Provider Metrics
    totalTherapists: number;
    liveTherapists: number;
    totalPlaces: number;
    livePlaces: number;
    newProvidersThisPeriod: number;
    
    // Hotel/Villa Metrics
    totalHotels: number;
    totalVillas: number;
    activeHotelVillas: number;
    
    // Booking Metrics
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    bookingCompletionRate: number;
    
    // Financial Metrics
    totalRevenue: number;
    totalCommissions: number;
    averageBookingValue: number;
    
    // Growth Metrics
    userGrowthRate: number;
    providerGrowthRate: number;
    revenueGrowthRate: number;
    
    // Engagement Metrics
    averageBookingsPerUser: number;
    averageBookingsPerProvider: number;
    platformConversionRate: number;
    
    // Top Performers
    topTherapists: Array<{
        id: number | string;
        name: string;
        bookings: number;
        revenue: number;
        rating: number;
    }>;
    topPlaces: Array<{
        id: number | string;
        name: string;
        bookings: number;
        revenue: number;
        rating: number;
    }>;
    topHotels: Array<{
        id: number | string;
        name: string;
        bookings: number;
        commissionsEarned: number;
    }>;
    
    // Period
    periodStart: string;
    periodEnd: string;
    lastUpdated: string;
}

// ============================================================================
// ANALYTICS SERVICE CLASS
// ============================================================================

class AnalyticsService {
    private readonly EVENTS_COLLECTION = 'analytics_events';

    private async runWithTimeout(promise: Promise<unknown>, timeoutMs = 2000): Promise<void> {
        return new Promise((resolve) => {
            const timer = setTimeout(() => resolve(), timeoutMs);
            promise
                .then(() => {
                    clearTimeout(timer);
                    resolve();
                })
                .catch(() => {
                    clearTimeout(timer);
                    resolve();
                });
        });
    }

    /**
     * Track a single analytics event
     */
    async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
        try {
            const eventData = {
                ...event,
                timestamp: new Date().toISOString(),
                sessionId: event.sessionId || this.generateSessionId(),
                metadata: JSON.stringify(event.metadata || {})
            };

            await databases.createDocument(
                DATABASE_ID,
                this.EVENTS_COLLECTION,
                ID.unique(),
                eventData
            );

            console.log(`📊 Event tracked: ${event.eventType}`);
        } catch (error) {
            console.error('Error tracking event:', error);
            // Don't throw - analytics should not break app functionality
        }
    }

    /**
     * Track profile view
     */
    async trackProfileView(
        providerId: number | string,
        providerType: 'therapist' | 'place',
        userId?: string
    ): Promise<void> {
        await this.trackEvent({
            eventType: AnalyticsEventType.PROFILE_VIEW,
            ...(providerType === 'therapist' ? { therapistId: providerId } : { placeId: providerId }),
            userId,
            metadata: { providerType }
        });
    }

    /**
     * Track shared link view for therapists
     */
    async trackSharedLinkView(
        therapistId: number | string,
        sessionId?: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.runWithTimeout(
            this.trackEvent({
                eventType: AnalyticsEventType.PROFILE_VIEW,
                therapistId,
                metadata: { source: 'shared_link', ...(metadata || {}) },
                sessionId
            })
        );
    }

    /**
     * Track shared link share action for therapists
     */
    async trackSharedLinkShare(
        therapistId: number | string,
        sessionId?: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.runWithTimeout(
            this.trackEvent({
                eventType: AnalyticsEventType.SHARE_CLICK,
                therapistId,
                metadata: { source: 'shared_link', ...(metadata || {}) },
                sessionId
            })
        );
    }

    /**
     * Track WhatsApp click
     */
    async trackWhatsAppClick(
        providerId: number | string,
        providerType: 'therapist' | 'place',
        userId?: string
    ): Promise<void> {
        await this.trackEvent({
            eventType: AnalyticsEventType.WHATSAPP_CLICK,
            ...(providerType === 'therapist' ? { therapistId: providerId } : { placeId: providerId }),
            userId,
            metadata: { providerType }
        });
    }

    /**
     * Track QR code scan (hotel/villa)
     */
    async trackQRScan(
        hotelVillaId: number | string,
        type: 'hotel' | 'villa'
    ): Promise<void> {
        await this.trackEvent({
            eventType: AnalyticsEventType.QR_SCAN,
            ...(type === 'hotel' ? { hotelId: hotelVillaId } : { villaId: hotelVillaId }),
            metadata: { type }
        });
    }

    /**
     * Track booking completion
     */
    async trackBookingCompleted(
        bookingId: number,
        providerId: number | string,
        providerType: 'therapist' | 'place',
        amount: number,
        userId?: string
    ): Promise<void> {
        await this.trackEvent({
            eventType: AnalyticsEventType.BOOKING_COMPLETED,
            bookingId,
            ...(providerType === 'therapist' ? { therapistId: providerId } : { placeId: providerId }),
            userId,
            amount,
            currency: 'IDR',
            metadata: { providerType }
        });
    }

    /**
     * Track revenue generation
     */
    async trackRevenue(
        providerId: number | string,
        providerType: 'therapist' | 'place',
        amount: number,
        bookingId?: number
    ): Promise<void> {
        await this.trackEvent({
            eventType: AnalyticsEventType.REVENUE_GENERATED,
            ...(providerType === 'therapist' ? { therapistId: providerId } : { placeId: providerId }),
            bookingId,
            amount,
            currency: 'IDR',
            metadata: { providerType }
        });
    }

    /**
     * Track commission earned (hotel/villa)
     */
    async trackCommissionEarned(
        hotelVillaId: number | string,
        type: 'hotel' | 'villa',
        amount: number,
        bookingId?: number
    ): Promise<void> {
        await this.trackEvent({
            eventType: AnalyticsEventType.COMMISSION_EARNED,
            ...(type === 'hotel' ? { hotelId: hotelVillaId } : { villaId: hotelVillaId }),
            bookingId,
            amount,
            currency: 'IDR',
            metadata: { type }
        });
    }

    // ========================================================================
    // ANALYTICS RETRIEVAL METHODS
    // ========================================================================

    /**
     * Get therapist analytics for a specific period
     */
    async getTherapistAnalytics(
        therapistId: number | string,
        startDate: string,
        endDate: string
    ): Promise<TherapistAnalytics> {
        try {
            const therapist = await this.getTherapistData(therapistId);
            
            // Query events for this therapist in date range
            const queries = [
                Query.equal('therapistId', therapistId.toString()),
                Query.greaterThanEqual('timestamp', startDate),
                Query.lessThanEqual('timestamp', endDate)
            ];

            const events = await databases.listDocuments(
                DATABASE_ID,
                this.EVENTS_COLLECTION,
                queries
            );

            // Calculate metrics
            const impressions = events.documents.filter(e => e.eventType === AnalyticsEventType.PROFILE_IMPRESSION).length;
            const profileViews = events.documents.filter(e => e.eventType === AnalyticsEventType.PROFILE_VIEW).length;
            const whatsappClicks = events.documents.filter(e => e.eventType === AnalyticsEventType.WHATSAPP_CLICK).length;
            const completedBookings = events.documents.filter(e => e.eventType === AnalyticsEventType.BOOKING_COMPLETED).length;
            const totalBookings = events.documents.filter(e => 
                e.eventType === AnalyticsEventType.BOOKING_COMPLETED || 
                e.eventType === AnalyticsEventType.BOOKING_CANCELLED
            ).length;
            const cancelledBookings = events.documents.filter(e => e.eventType === AnalyticsEventType.BOOKING_CANCELLED).length;

            // Calculate revenue
            const revenueEvents = events.documents.filter(e => e.eventType === AnalyticsEventType.REVENUE_GENERATED);
            const totalRevenue = revenueEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
            const averageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;

            // Calculate conversion rate
            const conversionRate = profileViews > 0 ? (completedBookings / profileViews) * 100 : 0;

            return {
                therapistId,
                therapistName: therapist?.name || 'Unknown',
                totalImpressions: impressions,
                totalProfileViews: profileViews,
                totalWhatsappClicks: whatsappClicks,
                totalBookings,
                completedBookings,
                cancelledBookings,
                totalRevenue,
                averageBookingValue,
                conversionRate,
                rating: therapist?.rating || 0,
                reviewCount: therapist?.reviewCount || 0,
                peakHours: this.calculatePeakHours(events.documents),
                periodStart: startDate,
                periodEnd: endDate
            };
        } catch (error) {
            console.error('Error getting therapist analytics:', error);
            throw error;
        }
    }

    /**
     * Get place analytics for a specific period
     */
    async getPlaceAnalytics(
        placeId: number | string,
        startDate: string,
        endDate: string
    ): Promise<PlaceAnalytics> {
        try {
            const place = await this.getPlaceData(placeId);
            
            const queries = [
                Query.equal('placeId', placeId.toString()),
                Query.greaterThanEqual('timestamp', startDate),
                Query.lessThanEqual('timestamp', endDate)
            ];

            const events = await databases.listDocuments(
                DATABASE_ID,
                this.EVENTS_COLLECTION,
                queries
            );

            const impressions = events.documents.filter(e => e.eventType === AnalyticsEventType.PROFILE_IMPRESSION).length;
            const profileViews = events.documents.filter(e => e.eventType === AnalyticsEventType.PROFILE_VIEW).length;
            const whatsappClicks = events.documents.filter(e => e.eventType === AnalyticsEventType.WHATSAPP_CLICK).length;
            const completedBookings = events.documents.filter(e => e.eventType === AnalyticsEventType.BOOKING_COMPLETED).length;
            const totalBookings = events.documents.filter(e => 
                e.eventType === AnalyticsEventType.BOOKING_COMPLETED || 
                e.eventType === AnalyticsEventType.BOOKING_CANCELLED
            ).length;
            const cancelledBookings = events.documents.filter(e => e.eventType === AnalyticsEventType.BOOKING_CANCELLED).length;

            const revenueEvents = events.documents.filter(e => e.eventType === AnalyticsEventType.REVENUE_GENERATED);
            const totalRevenue = revenueEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
            const averageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;
            const conversionRate = profileViews > 0 ? (completedBookings / profileViews) * 100 : 0;

            return {
                placeId,
                placeName: place?.name || 'Unknown',
                totalImpressions: impressions,
                totalProfileViews: profileViews,
                totalWhatsappClicks: whatsappClicks,
                totalBookings,
                completedBookings,
                cancelledBookings,
                totalRevenue,
                averageBookingValue,
                conversionRate,
                rating: place?.rating || 0,
                reviewCount: place?.reviewCount || 0,
                periodStart: startDate,
                periodEnd: endDate
            };
        } catch (error) {
            console.error('Error getting place analytics:', error);
            throw error;
        }
    }

    /**
     * Get hotel/villa analytics for a specific period
     */
    async getHotelVillaAnalytics(
        hotelVillaId: number | string,
        type: 'hotel' | 'villa',
        startDate: string,
        endDate: string
    ): Promise<HotelVillaAnalytics> {
        try {
            const queries = [
                Query.equal(type === 'hotel' ? 'hotelId' : 'villaId', hotelVillaId.toString()),
                Query.greaterThanEqual('timestamp', startDate),
                Query.lessThanEqual('timestamp', endDate)
            ];

            const events = await databases.listDocuments(
                DATABASE_ID,
                this.EVENTS_COLLECTION,
                queries
            );

            const qrScans = events.documents.filter(e => e.eventType === AnalyticsEventType.QR_SCAN).length;
            const menuViews = events.documents.filter(e => 
                e.eventType === AnalyticsEventType.HOTEL_MENU_VIEW || 
                e.eventType === AnalyticsEventType.VILLA_MENU_VIEW
            ).length;
            const completedBookings = events.documents.filter(e => e.eventType === AnalyticsEventType.BOOKING_COMPLETED).length;

            // Get commission data
            const commissionEvents = events.documents.filter(e => e.eventType === AnalyticsEventType.COMMISSION_EARNED);
            const totalCommissionEarned = commissionEvents.reduce((sum, e) => sum + (e.amount || 0), 0);

            return {
                hotelVillaId,
                name: 'Hotel/Villa Name', // TODO: Fetch from database
                type,
                totalQRScans: qrScans,
                uniqueGuestViews: qrScans, // Approximate
                menuViews,
                totalBookings: completedBookings,
                completedBookings,
                uniqueProvidersViewed: 0, // TODO: Calculate from events
                topProviders: [], // TODO: Calculate top providers
                totalCommissionEarned,
                pendingCommissions: 0, // TODO: Get from commission records
                verifiedCommissions: totalCommissionEarned,
                averageGuestRating: 0, // TODO: Get from feedback
                totalFeedbacks: 0,
                peakHours: this.calculatePeakHours(events.documents),
                periodStart: startDate,
                periodEnd: endDate
            };
        } catch (error) {
            console.error('Error getting hotel/villa analytics:', error);
            throw error;
        }
    }

    /**
     * Get platform-wide analytics
     */
    async getPlatformAnalytics(
        startDate: string,
        endDate: string
    ): Promise<PlatformAnalytics> {
        try {
            // Get counts from collections
            const [therapists, places, users, bookings] = await Promise.all([
                databases.listDocuments(DATABASE_ID, COLLECTIONS.THERAPISTS),
                databases.listDocuments(DATABASE_ID, COLLECTIONS.PLACES),
                databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS),
                databases.listDocuments(DATABASE_ID, COLLECTIONS.BOOKINGS, [
                    Query.greaterThanEqual('createdAt', startDate),
                    Query.lessThanEqual('createdAt', endDate)
                ])
            ]);

            const liveTherapists = therapists.documents.filter((t: any) => t.isLive).length;
            const livePlaces = places.documents.filter((p: any) => p.isLive).length;

            // Get revenue events
            const revenueEvents = await databases.listDocuments(
                DATABASE_ID,
                this.EVENTS_COLLECTION,
                [
                    Query.equal('eventType', AnalyticsEventType.REVENUE_GENERATED),
                    Query.greaterThanEqual('timestamp', startDate),
                    Query.lessThanEqual('timestamp', endDate)
                ]
            );

            const totalRevenue = revenueEvents.documents.reduce((sum, e) => sum + (e.amount || 0), 0);
            const completedBookingsCount = bookings.documents.filter((b: any) => b.status === 'Completed').length;
            const cancelledBookingsCount = bookings.documents.filter((b: any) => b.status === 'Cancelled').length;
            const bookingCompletionRate = bookings.documents.length > 0 
                ? (completedBookingsCount / bookings.documents.length) * 100 
                : 0;

            return {
                totalUsers: users.documents.length,
                activeUsers: users.documents.length, // TODO: Calculate active users
                newUsersThisPeriod: 0, // TODO: Calculate from date range
                totalTherapists: therapists.documents.length,
                liveTherapists,
                totalPlaces: places.documents.length,
                livePlaces,
                newProvidersThisPeriod: 0,
                totalHotels: 0, // TODO: Get from hotels collection
                totalVillas: 0, // TODO: Get from villas collection
                activeHotelVillas: 0,
                totalBookings: bookings.documents.length,
                completedBookings: completedBookingsCount,
                cancelledBookings: cancelledBookingsCount,
                bookingCompletionRate,
                totalRevenue,
                totalCommissions: 0, // TODO: Calculate from commission records
                averageBookingValue: completedBookingsCount > 0 ? totalRevenue / completedBookingsCount : 0,
                userGrowthRate: 0,
                providerGrowthRate: 0,
                revenueGrowthRate: 0,
                averageBookingsPerUser: users.documents.length > 0 ? bookings.documents.length / users.documents.length : 0,
                averageBookingsPerProvider: (therapists.documents.length + places.documents.length) > 0 
                    ? bookings.documents.length / (therapists.documents.length + places.documents.length) 
                    : 0,
                platformConversionRate: 0,
                topTherapists: [],
                topPlaces: [],
                topHotels: [],
                periodStart: startDate,
                periodEnd: endDate,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting platform analytics:', error);
            throw error;
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    private calculatePeakHours(events: any[]): string[] {
        const hourCounts: Record<string, number> = {};
        
        events.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            const hourKey = `${hour}:00`;
            hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
        });

        return Object.entries(hourCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour]) => hour);
    }

    private async getTherapistData(therapistId: number | string): Promise<any> {
        try {
            const docs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.THERAPISTS,
                [Query.equal('$id', therapistId.toString())]
            );
            return docs.documents[0];
        } catch (error) {
            console.error('Error fetching therapist:', error);
            return null;
        }
    }

    private async getPlaceData(placeId: number | string): Promise<any> {
        try {
            const docs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PLACES,
                [Query.equal('$id', placeId.toString())]
            );
            return docs.documents[0];
        } catch (error) {
            console.error('Error fetching place:', error);
            return null;
        }
    }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;

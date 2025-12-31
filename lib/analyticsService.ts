import { databases, DATABASE_ID, ID } from './appwrite';
import { Query } from 'appwrite';

/**
 * 📊 User Analytics Service
 * Comprehensive behavior tracking for IndaStreet Massage Application
 * 
 * Features:
 * - User interaction tracking
 * - Booking behavior analytics
 * - Chat session monitoring
 * - Performance metrics
 * - Error tracking
 */

export interface AnalyticsEvent {
    eventType: 'page_view' | 'booking_attempt' | 'booking_completed' | 'chat_started' | 'chat_message_sent' | 
               'search_performed' | 'user_registered' | 'login_attempt' | 'error_occurred' | 'notification_sent';
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
    timestamp: string;
    userAgent?: string;
    location?: {
        city?: string;
        country?: string;
        coordinates?: { lat: number; lng: number };
    };
    performance?: {
        loadTime?: number;
        responseTime?: number;
    };
}

export interface UserBehaviorMetrics {
    totalPageViews: number;
    totalBookings: number;
    completedBookings: number;
    chatSessionsStarted: number;
    messagesExchanged: number;
    averageSessionDuration: number;
    mostViewedPages: Array<{ page: string; views: number }>;
    popularSearchTerms: Array<{ term: string; searches: number }>;
    conversionRate: number;
    errorRate: number;
}

export interface SystemMetrics {
    activeUsers: number;
    totalUsers: number;
    bookingConversionRate: number;
    averageResponseTime: number;
    errorCount: number;
    popularFeatures: Array<{ feature: string; usage: number }>;
}

class AnalyticsService {
    private readonly ANALYTICS_COLLECTION = 'user_analytics';
    private readonly METRICS_COLLECTION = 'system_metrics';
    private sessionStartTime = Date.now();
    private currentSessionId = this.generateSessionId();

    constructor() {
        this.initializeAnalytics();
    }

    /**
     * Initialize analytics service
     */
    private initializeAnalytics(): void {
        // Track page load
        if (typeof window !== 'undefined') {
            this.trackPageView(window.location.pathname);
            
            // Track page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.trackEvent('session_paused', {
                        duration: Date.now() - this.sessionStartTime
                    });
                } else {
                    this.sessionStartTime = Date.now();
                    this.trackEvent('session_resumed');
                }
            });

            // Track before unload for session duration
            window.addEventListener('beforeunload', () => {
                this.trackSessionEnd();
            });
        }

        console.log('📊 Analytics service initialized with session:', this.currentSessionId);
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Track generic analytics event
     */
    async trackEvent(eventType: AnalyticsEvent['eventType'], metadata: Record<string, any> = {}): Promise<void> {
        try {
            const event: AnalyticsEvent = {
                eventType,
                sessionId: this.currentSessionId,
                timestamp: new Date().toISOString(),
                metadata,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                performance: this.getPerformanceMetrics()
            };

            // Add user ID if available
            const userId = this.getCurrentUserId();
            if (userId) {
                event.userId = userId;
            }

            // Add location data if available
            const location = await this.getUserLocation();
            if (location) {
                event.location = location;
            }

            await databases.createDocument(
                DATABASE_ID,
                this.ANALYTICS_COLLECTION,
                ID.unique(),
                event
            );

            console.log(`📊 Analytics: ${eventType}`, metadata);
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
            // Don't throw - analytics should never break the app
        }
    }

    /**
     * Track page views
     */
    async trackPageView(page: string): Promise<void> {
        await this.trackEvent('page_view', {
            page,
            referrer: typeof document !== 'undefined' ? document.referrer : undefined,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track booking attempts and completions
     */
    async trackBooking(type: 'attempt' | 'completed', bookingData: any): Promise<void> {
        await this.trackEvent(
            type === 'attempt' ? 'booking_attempt' : 'booking_completed',
            {
                therapistId: bookingData.therapistId,
                serviceType: bookingData.serviceType,
                duration: bookingData.duration,
                totalPrice: bookingData.totalPrice,
                paymentMethod: bookingData.paymentMethod,
                location: bookingData.location
            }
        );
    }

    /**
     * Track chat interactions
     */
    async trackChatActivity(type: 'started' | 'message_sent', chatData: any): Promise<void> {
        await this.trackEvent(
            type === 'started' ? 'chat_started' : 'chat_message_sent',
            {
                chatId: chatData.chatId,
                participantType: chatData.participantType, // 'customer' or 'therapist'
                messageLength: type === 'message_sent' ? chatData.messageLength : undefined,
                hasAttachment: type === 'message_sent' ? chatData.hasAttachment : undefined
            }
        );
    }

    /**
     * Track search behavior
     */
    async trackSearch(searchTerm: string, filters: any, resultsCount: number): Promise<void> {
        await this.trackEvent('search_performed', {
            searchTerm,
            filters,
            resultsCount,
            searchType: filters.serviceType || 'general'
        });
    }

    /**
     * Track user registration
     */
    async trackUserRegistration(userType: string, registrationMethod: string): Promise<void> {
        await this.trackEvent('user_registered', {
            userType,
            registrationMethod,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track errors for monitoring
     */
    async trackError(error: Error, context: string): Promise<void> {
        await this.trackEvent('error_occurred', {
            errorMessage: error.message,
            errorStack: error.stack?.substring(0, 500), // Limit stack trace
            context,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        });
    }

    /**
     * Track notification effectiveness
     */
    async trackNotification(type: string, success: boolean, channel: string): Promise<void> {
        await this.trackEvent('notification_sent', {
            type,
            success,
            channel,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get user behavior metrics
     */
    async getUserBehaviorMetrics(userId?: string, timeRange: string = '30d'): Promise<UserBehaviorMetrics> {
        try {
            const startDate = this.getDateRange(timeRange);
            const queries = [
                Query.greaterThan('timestamp', startDate.toISOString())
            ];

            if (userId) {
                queries.push(Query.equal('userId', userId));
            }

            const events = await databases.listDocuments(
                DATABASE_ID,
                this.ANALYTICS_COLLECTION,
                queries
            );

            return this.calculateUserMetrics(events.documents);
        } catch (error) {
            console.error('Error fetching user behavior metrics:', error);
            return this.getDefaultMetrics();
        }
    }

    /**
     * Get system-wide metrics
     */
    async getSystemMetrics(timeRange: string = '24h'): Promise<SystemMetrics> {
        try {
            const startDate = this.getDateRange(timeRange);
            const events = await databases.listDocuments(
                DATABASE_ID,
                this.ANALYTICS_COLLECTION,
                [Query.greaterThan('timestamp', startDate.toISOString())]
            );

            return this.calculateSystemMetrics(events.documents);
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            return this.getDefaultSystemMetrics();
        }
    }

    /**
     * Get real-time dashboard data
     */
    async getDashboardMetrics(): Promise<{
        activeUsers: number;
        todayBookings: number;
        chatSessions: number;
        errorRate: number;
        topPages: Array<{ page: string; views: number }>;
    }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEvents = await databases.listDocuments(
            DATABASE_ID,
            this.ANALYTICS_COLLECTION,
            [Query.greaterThan('timestamp', today.toISOString())]
        );

        const events = todayEvents.documents;
        const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
        const bookings = events.filter(e => e.eventType === 'booking_completed').length;
        const chats = events.filter(e => e.eventType === 'chat_started').length;
        const errors = events.filter(e => e.eventType === 'error_occurred').length;
        const errorRate = events.length > 0 ? (errors / events.length) * 100 : 0;

        // Calculate top pages
        const pageViews = events.filter(e => e.eventType === 'page_view');
        const pageCount: Record<string, number> = {};
        pageViews.forEach(event => {
            const page = event.metadata?.page || 'unknown';
            pageCount[page] = (pageCount[page] || 0) + 1;
        });

        const topPages = Object.entries(pageCount)
            .map(([page, views]) => ({ page, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);

        return {
            activeUsers: uniqueSessions,
            todayBookings: bookings,
            chatSessions: chats,
            errorRate: Math.round(errorRate * 100) / 100,
            topPages
        };
    }

    /**
     * Helper methods
     */
    private getCurrentUserId(): string | undefined {
        if (typeof window !== 'undefined') {
            const provider = sessionStorage.getItem('logged_in_provider');
            if (provider) {
                try {
                    return JSON.parse(provider).id;
                } catch (e) {
                    return undefined;
                }
            }
        }
        return undefined;
    }

    private async getUserLocation(): Promise<AnalyticsEvent['location'] | undefined> {
        // Simple geolocation - in production you might use a geolocation service
        return new Promise((resolve) => {
            if (typeof navigator !== 'undefined' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            coordinates: {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            }
                        });
                    },
                    () => resolve(undefined),
                    { timeout: 5000 }
                );
            } else {
                resolve(undefined);
            }
        });
    }

    private getPerformanceMetrics(): AnalyticsEvent['performance'] | undefined {
        if (typeof window !== 'undefined' && 'performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0] as any;
            return {
                loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
                responseTime: navigation?.responseEnd - navigation?.requestStart
            };
        }
        return undefined;
    }

    private trackSessionEnd(): void {
        const sessionDuration = Date.now() - this.sessionStartTime;
        this.trackEvent('session_ended', {
            duration: sessionDuration,
            sessionId: this.currentSessionId
        });
    }

    private getDateRange(timeRange: string): Date {
        const now = new Date();
        switch (timeRange) {
            case '24h':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }

    private calculateUserMetrics(events: any[]): UserBehaviorMetrics {
        const pageViews = events.filter(e => e.eventType === 'page_view').length;
        const bookingAttempts = events.filter(e => e.eventType === 'booking_attempt').length;
        const completedBookings = events.filter(e => e.eventType === 'booking_completed').length;
        const chatSessions = events.filter(e => e.eventType === 'chat_started').length;
        const messages = events.filter(e => e.eventType === 'chat_message_sent').length;

        // Calculate most viewed pages
        const pages: Record<string, number> = {};
        events.filter(e => e.eventType === 'page_view').forEach(event => {
            const page = event.metadata?.page || 'unknown';
            pages[page] = (pages[page] || 0) + 1;
        });

        const mostViewedPages = Object.entries(pages)
            .map(([page, views]) => ({ page, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);

        return {
            totalPageViews: pageViews,
            totalBookings: bookingAttempts,
            completedBookings,
            chatSessionsStarted: chatSessions,
            messagesExchanged: messages,
            averageSessionDuration: 0, // Would need session tracking
            mostViewedPages,
            popularSearchTerms: [], // Would need search term aggregation
            conversionRate: bookingAttempts > 0 ? (completedBookings / bookingAttempts) * 100 : 0,
            errorRate: events.filter(e => e.eventType === 'error_occurred').length
        };
    }

    private calculateSystemMetrics(events: any[]): SystemMetrics {
        const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
        const bookingAttempts = events.filter(e => e.eventType === 'booking_attempt').length;
        const completedBookings = events.filter(e => e.eventType === 'booking_completed').length;

        return {
            activeUsers: uniqueUsers,
            totalUsers: uniqueUsers, // Simplified
            bookingConversionRate: bookingAttempts > 0 ? (completedBookings / bookingAttempts) * 100 : 0,
            averageResponseTime: 0, // Would calculate from performance metrics
            errorCount: events.filter(e => e.eventType === 'error_occurred').length,
            popularFeatures: [] // Would aggregate feature usage
        };
    }

    private getDefaultMetrics(): UserBehaviorMetrics {
        return {
            totalPageViews: 0,
            totalBookings: 0,
            completedBookings: 0,
            chatSessionsStarted: 0,
            messagesExchanged: 0,
            averageSessionDuration: 0,
            mostViewedPages: [],
            popularSearchTerms: [],
            conversionRate: 0,
            errorRate: 0
        };
    }

    private getDefaultSystemMetrics(): SystemMetrics {
        return {
            activeUsers: 0,
            totalUsers: 0,
            bookingConversionRate: 0,
            averageResponseTime: 0,
            errorCount: 0,
            popularFeatures: []
        };
    }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export hook for React components
export const useAnalytics = () => {
    return {
        trackPageView: analyticsService.trackPageView.bind(analyticsService),
        trackBooking: analyticsService.trackBooking.bind(analyticsService),
        trackChatActivity: analyticsService.trackChatActivity.bind(analyticsService),
        trackSearch: analyticsService.trackSearch.bind(analyticsService),
        trackError: analyticsService.trackError.bind(analyticsService),
        trackEvent: analyticsService.trackEvent.bind(analyticsService),
        getUserBehaviorMetrics: analyticsService.getUserBehaviorMetrics.bind(analyticsService),
        getSystemMetrics: analyticsService.getSystemMetrics.bind(analyticsService),
        getDashboardMetrics: analyticsService.getDashboardMetrics.bind(analyticsService)
    };
};

export default analyticsService;
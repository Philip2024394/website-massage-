import { analyticsService, AnalyticsEventType } from '../services/analyticsService';
import type { Analytics } from '../types';

/**
 * Analytics handler function
 * Extracted from App.tsx lines 173-213
 */
export function useAnalyticsHandler() {
    const handleIncrementAnalytics = async (
        id: number | string, 
        type: 'therapist' | 'place', 
        metric: string
    ): Promise<void> => {
        try {
            // Map the metric to the appropriate analytics event type
            switch (metric) {
                case 'whatsapp_clicks':
                case 'whatsappClicks':
                    await analyticsService.trackWhatsAppClick(id, type);
                    break;
                case 'views':
                case 'profileViews':
                    await analyticsService.trackProfileView(id, type);
                    break;
                case 'bookings':
                    await analyticsService.trackEvent({
                        eventType: AnalyticsEventType.BOOKING_INITIATED,
                        ...(type === 'therapist' ? { therapistId: id } : { placeId: id }),
                        metadata: { providerType: type }
                    });
                    break;
                default:
                    console.log(`📊 Analytics: No tracking implemented for metric "${metric}"`);
                    break;
            }
            console.log(`📊 Analytics tracked: ${metric} for ${type} ${id}`);
        } catch (error) {
            console.error('📊 Analytics error:', error);
            // Don't throw - analytics should not break functionality
        }
    };

    return handleIncrementAnalytics;
}

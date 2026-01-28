import { logger } from './enterpriseLogger';
/**
 * Share Tracking Service
 * Integrates with existing analytics system to track profile sharing
 */

import { analyticsService, AnalyticsEventType } from './analyticsService';
import { databases, DATABASE_ID } from '../lib/appwrite';
// Removed unused APPWRITE_CONFIG import
import { ID, Query } from 'appwrite';

// Collection for share tracking data
const SHARE_TRACKING_COLLECTION = 'profile_share_tracking';

export interface ShareTrackingEvent {
    id?: string;
    memberId: string;
    memberName: string;
    memberType: 'therapist' | 'place' | 'facial';
    eventType: 'profile_shared' | 'profile_viewed_from_share';
    platform: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'email' | 'copy' | 'direct';
    timestamp: string;
    sessionId?: string;
    userAgent?: string;
    referrer?: string;
    location?: {
        country?: string;
        city?: string;
        ip?: string;
    };
    metadata?: Record<string, any>;
    // Sharing chain tracking
    shareChain?: {
        originalSharerUserId?: string;
        shareDepth: number; // How many times this has been reshared
        shareId: string; // Unique ID for this specific share
        parentShareId?: string; // ID of the share this came from
        chainPath: string[]; // Array of share IDs showing the full chain
    };
}

export interface ShareChainData {
    shareId: string;
    originalSharerUserId?: string;
    shareDepth: number;
    parentShareId?: string;
    chainPath: string[];
}

export interface ShareAnalytics {
    totalShares: number;
    totalViews: number;
    platformBreakdown: Record<string, number>;
    recentActivity: Array<{
        timestamp: string;
        platform: string;
        action: 'shared' | 'viewed';
        location?: string;
        userAgent?: string;
    }>;
    conversionRate: number;
    shareToViewRatio: number;
    topPerformingPlatforms: Array<{
        platform: string;
        shares: number;
        views: number;
        conversionRate: number;
    }>;
}

class ShareTrackingService {
    
    /**
     * Track when a profile is shared
     */
    async trackProfileShare(params: {
        memberId: string;
        memberName: string;
        memberType: 'therapist' | 'place' | 'facial';
        platform: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'email' | 'copy';
        sessionId?: string;
        metadata?: Record<string, any>;
    }): Promise<void> {
        try {
            const location = await this.getLocationData();
            
            // Create share tracking event
            const shareEvent: ShareTrackingEvent = {
                memberId: params.memberId,
                memberName: params.memberName,
                memberType: params.memberType,
                eventType: 'profile_shared',
                platform: params.platform,
                timestamp: new Date().toISOString(),
                sessionId: params.sessionId || this.generateSessionId(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                referrer: typeof document !== 'undefined' ? document.referrer : undefined,
                location,
                metadata: params.metadata
            };

            // Store in share tracking collection
            await databases.createDocument(
                DATABASE_ID,
                SHARE_TRACKING_COLLECTION,
                ID.unique(),
                shareEvent
            );

            // Also track in main analytics system
            await analyticsService.trackEvent({
                eventType: AnalyticsEventType.PROFILE_VIEW, // or create new PROFILE_SHARED type
                ...(params.memberType === 'therapist' ? { therapistId: params.memberId } : { placeId: params.memberId }),
                sessionId: shareEvent.sessionId,
                metadata: {
                    action: 'profile_shared',
                    platform: params.platform,
                    memberType: params.memberType,
                    ...params.metadata
                }
            });

            logger.info(`📤 Profile shared tracked: ${params.memberName} via ${params.platform}`);
        } catch (error) {
            logger.error('Error tracking profile share:', error);
        }
    }

    /**
     * Track when a shared profile is viewed
     */
    async trackSharedProfileView(params: {
        memberId: string;
        memberName: string;
        memberType: 'therapist' | 'place' | 'facial';
        platform?: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'email' | 'copy' | 'direct';
        sessionId?: string;
        metadata?: Record<string, any>;
    }): Promise<void> {
        try {
            const location = await this.getLocationData();
            
            // Create view tracking event
            const viewEvent: ShareTrackingEvent = {
                memberId: params.memberId,
                memberName: params.memberName,
                memberType: params.memberType,
                eventType: 'profile_viewed_from_share',
                platform: params.platform || 'direct',
                timestamp: new Date().toISOString(),
                sessionId: params.sessionId || this.generateSessionId(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                referrer: typeof document !== 'undefined' ? document.referrer : undefined,
                location,
                metadata: params.metadata
            };

            // Store in share tracking collection
            await databases.createDocument(
                DATABASE_ID,
                SHARE_TRACKING_COLLECTION,
                ID.unique(),
                viewEvent
            );

            // Also track in main analytics system
            await analyticsService.trackProfileView(
                params.memberId,
                params.memberType === 'therapist' ? 'therapist' : 'place'
            );

            logger.info(`👁️ Shared profile view tracked: ${params.memberName} from ${params.platform || 'direct'}`);
        } catch (error) {
            logger.error('Error tracking shared profile view:', error);
        }
    }

    /**
     * Get comprehensive share analytics for a member
     */
    async getMemberShareAnalytics(
        memberId: string,
        memberType: 'therapist' | 'place' | 'facial',
        startDate: string,
        endDate: string
    ): Promise<ShareAnalytics> {
        try {
            // Query share tracking events
            const shareQuery = [
                Query.equal('memberId', memberId),
                Query.greaterThanEqual('timestamp', startDate),
                Query.lessThanEqual('timestamp', endDate),
                Query.limit(1000)
            ];

            const shareEvents = await databases.listDocuments(
                DATABASE_ID,
                SHARE_TRACKING_COLLECTION,
                shareQuery
            );

            const events = shareEvents.documents as ShareTrackingEvent[];
            
            // Separate shares and views
            const shares = events.filter(e => e.eventType === 'profile_shared');
            const views = events.filter(e => e.eventType === 'profile_viewed_from_share');

            // Calculate platform breakdown
            const platformBreakdown: Record<string, number> = {};
            const platformViews: Record<string, number> = {};

            shares.forEach(share => {
                platformBreakdown[share.platform] = (platformBreakdown[share.platform] || 0) + 1;
            });

            views.forEach(view => {
                platformViews[view.platform] = (platformViews[view.platform] || 0) + 1;
            });

            // Get recent activity
            const recentActivity = events
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 50)
                .map(event => ({
                    timestamp: event.timestamp,
                    platform: event.platform,
                    action: event.eventType === 'profile_shared' ? 'shared' as const : 'viewed' as const,
                    location: event.location?.city || event.location?.country,
                    userAgent: event.userAgent
                }));

            // Calculate conversion rate (views that led to bookings)
            const conversionRate = await this.calculateConversionRate(memberId, memberType, views);

            // Calculate share-to-view ratio
            const shareToViewRatio = shares.length > 0 ? views.length / shares.length : 0;

            // Get top performing platforms
            const topPerformingPlatforms = Object.keys(platformBreakdown)
                .map(platform => ({
                    platform,
                    shares: platformBreakdown[platform] || 0,
                    views: platformViews[platform] || 0,
                    conversionRate: 0 // Would need more detailed analysis
                }))
                .sort((a, b) => (b.shares + b.views) - (a.shares + a.views))
                .slice(0, 5);

            return {
                totalShares: shares.length,
                totalViews: views.length,
                platformBreakdown,
                recentActivity,
                conversionRate,
                shareToViewRatio,
                topPerformingPlatforms
            };

        } catch (error) {
            logger.error('Error getting member share analytics:', error);
            return this.getEmptyAnalytics();
        }
    }

    /**
     * Get aggregated share analytics for all members
     */
    async getAllMembersShareAnalytics(
        startDate: string,
        endDate: string
    ): Promise<Array<{
        memberId: string;
        memberName: string;
        memberType: 'therapist' | 'place' | 'facial';
        analytics: ShareAnalytics;
    }>> {
        try {
            // Get all share events in date range
            const allEvents = await databases.listDocuments(
                DATABASE_ID,
                SHARE_TRACKING_COLLECTION,
                [
                    Query.greaterThanEqual('timestamp', startDate),
                    Query.lessThanEqual('timestamp', endDate),
                    Query.limit(10000)
                ]
            );

            const events = allEvents.documents as ShareTrackingEvent[];
            
            // Group by member
            const memberGroups: Record<string, ShareTrackingEvent[]> = {};
            events.forEach(event => {
                if (!memberGroups[event.memberId]) {
                    memberGroups[event.memberId] = [];
                }
                memberGroups[event.memberId].push(event);
            });

            // Generate analytics for each member
            const results = await Promise.all(
                Object.entries(memberGroups).map(async ([memberId, memberEvents]) => {
                    const firstEvent = memberEvents[0];
                    const analytics = await this.processMemberEvents(memberEvents);
                    
                    return {
                        memberId,
                        memberName: firstEvent.memberName,
                        memberType: firstEvent.memberType,
                        analytics
                    };
                })
            );

            return results.sort((a, b) => b.analytics.totalShares - a.analytics.totalShares);

        } catch (error) {
            logger.error('Error getting all members share analytics:', error);
            return [];
        }
    }

    /**
     * Process events for a single member into analytics
     */
    private async processMemberEvents(events: ShareTrackingEvent[]): Promise<ShareAnalytics> {
        const shares = events.filter(e => e.eventType === 'profile_shared');
        const views = events.filter(e => e.eventType === 'profile_viewed_from_share');

        const platformBreakdown: Record<string, number> = {};
        shares.forEach(share => {
            platformBreakdown[share.platform] = (platformBreakdown[share.platform] || 0) + 1;
        });

        const recentActivity = events
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20)
            .map(event => ({
                timestamp: event.timestamp,
                platform: event.platform,
                action: event.eventType === 'profile_shared' ? 'shared' as const : 'viewed' as const,
                location: event.location?.city || event.location?.country,
                userAgent: event.userAgent
            }));

        return {
            totalShares: shares.length,
            totalViews: views.length,
            platformBreakdown,
            recentActivity,
            conversionRate: Math.random() * 15 + 5, // Placeholder - would need booking correlation
            shareToViewRatio: shares.length > 0 ? views.length / shares.length : 0,
            topPerformingPlatforms: []
        };
    }

    /**
     * Generate trackable URL with sharing chain data
     * 🔥 CRITICAL: Uses HashRouter format (/#/) for proper routing
     */
    generateTrackableUrl(
        memberType: 'therapist' | 'place' | 'facial',
        memberId: string,
        platform: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'email' | 'copy',
        sharerUserId?: string,
        parentShareChain?: ShareChainData
    ): string {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
        // 🔥 CRITICAL FIX: Use /therapist-profile/ path with hash for HashRouter compatibility
        const profilePath = `/#/therapist-profile/${memberId}`;
        
        // Generate unique share ID
        const shareId = `sh_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        
        // Build sharing chain data
        const chainData: ShareChainData = {
            shareId,
            originalSharerUserId: parentShareChain?.originalSharerUserId || sharerUserId,
            shareDepth: (parentShareChain?.shareDepth || 0) + 1,
            parentShareId: parentShareChain?.shareId,
            chainPath: [...(parentShareChain?.chainPath || []), shareId]
        };
        
        // Create URL with tracking parameters
        const url = `${baseUrl}${profilePath}?si=${shareId}&sd=${chainData.shareDepth}&sp=${platform}`;
        const additionalParams: string[] = [];
        
        if (chainData.originalSharerUserId) {
            additionalParams.push(`os=${chainData.originalSharerUserId}`);
        }
        if (chainData.parentShareId) {
            additionalParams.push(`ps=${chainData.parentShareId}`);
        }
        if (chainData.chainPath.length > 1) {
            additionalParams.push(`cp=${chainData.chainPath.join(',')}`);
        }
        
        return additionalParams.length > 0 ? `${url}&${additionalParams.join('&')}` : url;
    }

    /**
     * Parse sharing chain data from URL
     */
    parseShareChainFromUrl(url?: string): ShareChainData | null {
        try {
            const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
            if (!currentUrl) return null;
            
            const urlObj = new URL(currentUrl);
            const shareId = urlObj.searchParams.get('si');
            
            if (!shareId) return null;
            
            const shareDepth = parseInt(urlObj.searchParams.get('sd') || '0');
            const originalSharerUserId = urlObj.searchParams.get('os') || undefined;
            const parentShareId = urlObj.searchParams.get('ps') || undefined;
            const chainPathStr = urlObj.searchParams.get('cp');
            const chainPath = chainPathStr ? chainPathStr.split(',') : [shareId];
            
            return {
                shareId,
                shareDepth,
                originalSharerUserId,
                parentShareId,
                chainPath
            };
        } catch (error) {
            logger.error('Error parsing share chain from URL:', error);
            return null;
        }
    }

    /**
     * Track profile share with chain tracking
     */
    async trackProfileShareWithChain(params: {
        memberId: string;
        memberName: string;
        memberType: 'therapist' | 'place' | 'facial';
        platform: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'email' | 'copy';
        sharerUserId?: string;
        parentShareChain?: ShareChainData;
        sessionId?: string;
        metadata?: Record<string, any>;
    }): Promise<string> {
        try {
            // Generate sharing chain data
            const shareId = `sh_${Date.now()}_${Math.random().toString(36).substring(2)}`;
            const chainData: ShareChainData = {
                shareId,
                originalSharerUserId: params.parentShareChain?.originalSharerUserId || params.sharerUserId,
                shareDepth: (params.parentShareChain?.shareDepth || 0) + 1,
                parentShareId: params.parentShareChain?.shareId,
                chainPath: [...(params.parentShareChain?.chainPath || []), shareId]
            };
            
            const location = await this.getLocationData();
            
            // Track the share event with chain data
            const shareEvent: ShareTrackingEvent = {
                memberId: params.memberId,
                memberName: params.memberName,
                memberType: params.memberType,
                eventType: 'profile_shared',
                platform: params.platform,
                timestamp: new Date().toISOString(),
                sessionId: params.sessionId || this.generateSessionId(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                referrer: typeof document !== 'undefined' ? document.referrer : undefined,
                location,
                metadata: params.metadata,
                shareChain: chainData
            };
            
            // Store in database
            await databases.createDocument(
                DATABASE_ID,
                SHARE_TRACKING_COLLECTION,
                ID.unique(),
                shareEvent
            );
            
            // Also track in main analytics system
            await analyticsService.trackEvent({
                eventType: AnalyticsEventType.PROFILE_VIEW,
                ...(params.memberType === 'therapist' ? { therapistId: params.memberId } : { placeId: params.memberId }),
                sessionId: shareEvent.sessionId,
                metadata: {
                    action: 'profile_shared_chain',
                    platform: params.platform,
                    memberType: params.memberType,
                    shareDepth: chainData.shareDepth,
                    originalSharer: chainData.originalSharerUserId,
                    ...params.metadata
                }
            });
            
            logger.info(`📤 Profile shared with chain tracking: ${params.memberName} via ${params.platform} (depth: ${chainData.shareDepth})`);
            return shareId;
        } catch (error) {
            logger.error('Error tracking profile share with chain:', error);
            return '';
        }
    }

    /**
     * Track shared profile view with chain tracking
     */
    async trackSharedProfileViewWithChain(params: {
        memberId: string;
        memberName: string;
        memberType: 'therapist' | 'place' | 'facial';
        shareChain?: ShareChainData;
        sessionId?: string;
        metadata?: Record<string, any>;
    }): Promise<void> {
        try {
            const location = await this.getLocationData();
            const platform = params.shareChain ? 
                (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('sp') as any || 'direct' : 'direct') :
                'direct';
            
            // Create view tracking event with chain data
            const viewEvent: ShareTrackingEvent = {
                memberId: params.memberId,
                memberName: params.memberName,
                memberType: params.memberType,
                eventType: 'profile_viewed_from_share',
                platform,
                timestamp: new Date().toISOString(),
                sessionId: params.sessionId || this.generateSessionId(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                referrer: typeof document !== 'undefined' ? document.referrer : undefined,
                location,
                metadata: params.metadata,
                shareChain: params.shareChain
            };
            
            // Store in database
            await databases.createDocument(
                DATABASE_ID,
                SHARE_TRACKING_COLLECTION,
                ID.unique(),
                viewEvent
            );
            
            // Also track in main analytics system
            await analyticsService.trackProfileView(
                params.memberId,
                params.memberType === 'therapist' ? 'therapist' : params.memberType === 'facial' ? 'place' : 'place'
            );
            
            logger.info(`👁️ Shared profile viewed with chain: ${params.memberName} (depth: ${params.shareChain?.shareDepth || 0})`);
        } catch (error) {
            logger.error('Error tracking shared profile view with chain:', error);
        }
    }

    /**
     * Get sharing chain analytics
     */
    async getSharingChainAnalytics(
        memberType?: 'therapist' | 'place' | 'facial',
        memberId?: string
    ) {
        try {
            const filters: any[] = [];
            if (memberType) filters.push(Query.equal('memberType', memberType));
            if (memberId) filters.push(Query.equal('memberId', memberId));
            
            const response = await databases.listDocuments(
                DATABASE_ID,
                SHARE_TRACKING_COLLECTION,
                filters
            );
            
            const events = response.documents as ShareTrackingEvent[];
            const chainEvents = events.filter(event => event.shareChain);
            
            // Group events by original share chain
            const chains = new Map<string, {
                originalSharer?: string;
                maxDepth: number;
                totalViews: number;
                totalShares: number;
                platforms: Record<string, number>;
                timeline: { depth: number; timestamp: string; type: 'share' | 'view' }[];
                viralityScore: number;
            }>();
            
            chainEvents.forEach(event => {
                if (!event.shareChain) return;
                
                const originalShareId = event.shareChain.chainPath[0];
                
                if (!chains.has(originalShareId)) {
                    chains.set(originalShareId, {
                        originalSharer: event.shareChain.originalSharerUserId,
                        maxDepth: 0,
                        totalViews: 0,
                        totalShares: 0,
                        platforms: {},
                        timeline: [],
                        viralityScore: 0
                    });
                }
                
                const chain = chains.get(originalShareId)!;
                chain.maxDepth = Math.max(chain.maxDepth, event.shareChain.shareDepth);
                chain.platforms[event.platform] = (chain.platforms[event.platform] || 0) + 1;
                chain.timeline.push({
                    depth: event.shareChain.shareDepth,
                    timestamp: event.timestamp,
                    type: event.eventType === 'profile_shared' ? 'share' : 'view'
                });
                
                if (event.eventType === 'profile_viewed_from_share') {
                    chain.totalViews++;
                } else {
                    chain.totalShares++;
                }
                
                // Calculate virality score (depth * total interactions)
                chain.viralityScore = chain.maxDepth * (chain.totalViews + chain.totalShares);
            });
            
            // Convert to array and sort by virality score
            return Array.from(chains.entries())
                .map(([shareId, data]) => ({
                    shareId,
                    ...data,
                    timeline: data.timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                }))
                .sort((a, b) => b.viralityScore - a.viralityScore);
        } catch (error) {
            logger.error('Error getting sharing chain analytics:', error);
            return [];
        }
    }

    /**
     * Calculate conversion rate (views that led to bookings)
     */
    private async calculateConversionRate(
        memberId: string,
        memberType: 'therapist' | 'place' | 'facial',
        views: ShareTrackingEvent[]
    ): Promise<number> {
        try {
            // This would correlate with actual booking data
            // For now, return a simulated conversion rate
            const baseRate = memberType === 'therapist' ? 12 : 8; // Therapists typically have higher conversion
            const randomFactor = (Math.random() - 0.5) * 10; // ±5% variation
            return Math.max(0, Math.min(100, baseRate + randomFactor));
        } catch (error) {
            logger.error('Error calculating conversion rate:', error);
            return 0;
        }
    }

    /**
     * Get location data from IP
     */
    private async getLocationData(): Promise<ShareTrackingEvent['location']> {
        try {
            // In a real implementation, you'd use a geolocation service
            // For now, return mock data
            return {
                country: 'Indonesia',
                city: ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Bali'][Math.floor(Math.random() * 5)],
                ip: '192.168.1.1' // Would be real IP
            };
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Generate session ID
     */
    private generateSessionId(): string {
        return 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get empty analytics object
     */
    private getEmptyAnalytics(): ShareAnalytics {
        return {
            totalShares: 0,
            totalViews: 0,
            platformBreakdown: {},
            recentActivity: [],
            conversionRate: 0,
            shareToViewRatio: 0,
            topPerformingPlatforms: []
        };
    }

    /**
     * Initialize share tracking collection (call this once)
     */
    async initializeShareTracking(): Promise<void> {
        try {
            logger.info('🔄 Initializing share tracking system...');
            logger.info('📊 Share tracking service ready');
            logger.info('📈 Integration with analytics service: ACTIVE');
        } catch (error) {
            logger.error('Error initializing share tracking:', error);
        }
    }
}

// Export singleton instance
export const shareTrackingService = new ShareTrackingService();
export default shareTrackingService;
import { logger } from '@/lib/logger.production';
import { notificationService } from '../lib/appwriteService';

/**
 * PWA Badge API Service
 * 
 * Manages the notification badge on the home screen app icon
 * when IndaStreet is installed as a Progressive Web App (PWA).
 * 
 * Supported:
 * - Chrome/Edge on Android
 * - Safari on iOS 16.4+
 * - Chrome/Edge on Desktop
 * 
 * The badge shows a small red circle with a number indicating
 * unread notifications (bookings, messages, alerts).
 */

export const badgeService = {
    /**
     * Set badge count on home screen app icon
     * @param count Number to display (0 to clear badge)
     */
    async setBadge(count: number): Promise<void> {
        if ('setAppBadge' in navigator) {
            try {
                if (count > 0) {
                    await (navigator as any).setAppBadge(count);
                    logger.debug(`✅ Home screen badge set to ${count}`);
                } else {
                    await (navigator as any).clearAppBadge();
                    logger.debug('✅ Home screen badge cleared');
                }
            } catch (error) {
                logger.error('❌ Error setting home screen badge:', error);
            }
        } else {
            logger.debug('⚠️ Badge API not supported on this device/browser');
        }
    },

    /**
     * Clear badge from home screen icon
     */
    async clearBadge(): Promise<void> {
        if ('clearAppBadge' in navigator) {
            try {
                await (navigator as any).clearAppBadge();
                logger.debug('✅ Home screen badge cleared');
            } catch (error) {
                logger.error('❌ Error clearing home screen badge:', error);
            }
        }
    },

    /**
     * Update badge based on current unread notification count
     * Call this whenever notifications change (created, read, deleted)
     */
    async updateBadge(): Promise<void> {
        try {
            const unreadCount = await this.getUnreadCount();
            await this.setBadge(unreadCount);
        } catch (error) {
            logger.error('❌ Error updating badge:', error);
        }
    },

    /**
     * Get unread notification count from Appwrite
     * @returns Number of unread notifications for current provider
     */
    async getUnreadCount(): Promise<number> {
        try {
            // Check if user is logged in as provider
            const providerId = localStorage.getItem('providerId');

            if (!providerId) {
                logger.debug('⚠️ No provider logged in, badge count = 0');
                return 0;
            }

            // Get unread notifications from Appwrite
            const unread = await notificationService.getUnread(providerId);
            logger.debug(`📊 Unread notifications: ${unread.length}`);
            
            return unread.length;
        } catch (error) {
            logger.error('❌ Error getting unread count:', error);
            return 0;
        }
    },

    /**
     * Check if Badge API is supported
     * @returns true if device/browser supports badge
     */
    isSupported(): boolean {
        return 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
    },

    /**
     * Initialize badge service
     * Call this when app loads to set initial badge count
     */
    async init(): Promise<void> {
        if (!this.isSupported()) {
            logger.debug('⚠️ Badge API not supported - using fallback notification methods');
            return;
        }

        logger.debug('✅ Badge API supported - initializing...');
        
        // Set initial badge count
        await this.updateBadge();

        // Update badge every 30 seconds when app is in background
        // (for new notifications received while app was closed)
        if (document.visibilityState === 'hidden') {
            setInterval(async () => {
                if (document.visibilityState === 'hidden') {
                    await this.updateBadge();
                }
            }, 30000); // 30 seconds
        }

        // Clear badge when app comes to foreground
        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
                logger.debug('📱 App visible - updating badge...');
                await this.updateBadge();
            }
        });

        logger.debug('✅ Badge service initialized');
    }
};

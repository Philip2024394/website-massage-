/**
 * ULTIMATE NOTIFICATION UTILITIES
 * Maximizes notification visibility, vibration, and persistence for standby mode
 * Ensures therapists never miss bookings
 */

export class UltimateNotificationUtils {
    private static badgeCount = 0;

    /**
     * Update app badge counter (shows unread count on app icon)
     */
    static async updateBadge(count?: number): Promise<void> {
        try {
            if (count !== undefined) {
                this.badgeCount = count;
            }

            // Modern Badge API (Android, some iOS)
            if ('setAppBadge' in navigator) {
                if (this.badgeCount > 0) {
                    await (navigator as any).setAppBadge(this.badgeCount);
                } else {
                    await (navigator as any).clearAppBadge();
                }
                console.log(`📛 Badge updated: ${this.badgeCount}`);
            }
        } catch (error) {
            console.log('Badge API not supported:', error);
        }
    }

    /**
     * Increment badge counter
     */
    static async incrementBadge(): Promise<void> {
        this.badgeCount++;
        await this.updateBadge();
    }

    /**
     * Clear badge counter
     */
    static async clearBadge(): Promise<void> {
        this.badgeCount = 0;
        await this.updateBadge();
        
        // Also notify service worker to clear
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CLEAR_BADGE'
            });
        }
    }

    /**
     * Register background sync to check for missed notifications
     */
    static async registerBackgroundSync(): Promise<void> {
        try {
            if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await (registration as any).sync.register('sync-notifications');
                console.log('✅ Background sync registered');
            }
        } catch (error) {
            console.log('Background sync not supported:', error);
        }
    }

    /**
     * Trigger maximum vibration (works even in silent mode on most phones)
     */
    static vibrateMaximum(): void {
        if ('vibrate' in navigator) {
            // Maximum 7-second vibration pattern
            navigator.vibrate([1000, 200, 1000, 200, 1000, 200, 1000]);
        }
    }

    /**
     * Keep screen awake for notification visibility (when app is open)
     */
    static async requestWakeLock(): Promise<WakeLockSentinel | null> {
        try {
            if ('wakeLock' in navigator) {
                const wakeLock = await (navigator as any).wakeLock.request('screen');
                console.log('🔆 Wake lock activated - screen will stay on');
                
                // Auto-release after 2 minutes
                setTimeout(() => {
                    wakeLock.release();
                }, 120000);
                
                return wakeLock;
            }
        } catch (error) {
            console.log('Wake lock not supported:', error);
        }
        return null;
    }

    /**
     * Setup notification listener for when app comes back from standby
     */
    static setupStandbyRecovery(): void {
        // Listen for visibility changes
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden) {
                console.log('👀 App visible - checking for missed notifications');
                
                // Trigger sync check
                await this.registerBackgroundSync();
                
                // Update badge from current notifications
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    const notifications = await registration.getNotifications();
                    await this.updateBadge(notifications.length);
                }
            }
        });

        // Listen for online/offline
        window.addEventListener('online', async () => {
            console.log('🌐 Connection restored - syncing notifications');
            await this.registerBackgroundSync();
        });
    }

    /**
     * Initialize all ultimate notification features
     */
    static async initialize(): Promise<void> {
        console.log('🚀 Initializing ultimate notification system...');
        
        // Setup recovery listeners
        this.setupStandbyRecovery();
        
        // Register background sync
        await this.registerBackgroundSync();
        
        // Setup service worker message listener
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'sync-missed-notifications') {
                    console.log('🔄 Service worker requesting notification sync');
                    // Trigger app-level notification check
                    window.dispatchEvent(new CustomEvent('check-missed-notifications'));
                }
            });
        }
        
        console.log('✅ Ultimate notification system ready');
    }

    /**
     * Test notification system with maximum settings
     */
    static async testUltimateNotification(): Promise<void> {
        // Increment badge
        await this.incrementBadge();
        
        // Maximum vibration
        this.vibrateMaximum();
        
        // Request wake lock
        await this.requestWakeLock();
        
        // Show test notification
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification('🧪 TEST NOTIFICATION', {
                body: 'Testing maximum vibration and visibility settings',
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                vibrate: [1000, 200, 1000, 200, 1000, 200, 1000],
                requireInteraction: true,
                sticky: true,
                renotify: true,
                tag: `test-${Date.now()}`,
                timestamp: Date.now(),
                actions: [
                    {
                        action: 'test-ok',
                        title: '✅ BERHASIL - Suara & Getar Kerja!'
                    }
                ]
            });
            
            console.log('✅ Test notification sent with maximum settings');
        }
    }
}

import { databases, DATABASE_ID } from './appwrite';

interface SystemHealthData {
    memberId: string;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    browserSupport: boolean;
    isOnline: boolean;
    browserVersion: string;
    deviceType: string;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
    lastMessageSent: string;
}

class SystemHealthService {
    private healthCheckInterval: number | null = null;
    private memberId: string | null = null;
    private HEALTH_CHECK_INTERVAL = 60000; // Every 1 minute

    /**
     * Initialize health monitoring for a member
     */
    startHealthMonitoring(memberId: string) {
        this.memberId = memberId;
        
        // Send initial health check
        this.sendHealthCheck();

        // Set up periodic health checks
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.healthCheckInterval = window.setInterval(() => {
            this.sendHealthCheck();
        }, this.HEALTH_CHECK_INTERVAL);

        console.log('✅ System health monitoring started');
    }

    /**
     * Stop health monitoring
     */
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        console.log('🛑 System health monitoring stopped');
    }

    /**
     * Send health check to admin dashboard
     */
    private async sendHealthCheck() {
        if (!this.memberId) return;

        try {
            const healthData = await this.collectHealthData();

            await databases.createDocument(
                DATABASE_ID,
                'system_health_checks',
                'unique()',
                {
                    memberId: this.memberId,
                    notificationsEnabled: healthData.notificationsEnabled,
                    soundEnabled: healthData.soundEnabled,
                    browserSupport: healthData.browserSupport,
                    isOnline: healthData.isOnline,
                    browserVersion: healthData.browserVersion,
                    deviceType: healthData.deviceType,
                    connectionQuality: healthData.connectionQuality,
                    lastMessageSent: healthData.lastMessageSent,
                    timestamp: new Date().toISOString()
                }
            );

            console.log('📊 Health check sent successfully');
        } catch (error) {
            // Silently handle missing collection - not critical for app functionality
            if (error instanceof Error && (error.message.includes('system_health_checks') || error.message.includes('404'))) {
                // Collection doesn't exist - skip silently without logging
                return;
            }
            console.warn('⚠️ Health check skipped:', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    /**
     * Collect system health data
     */
    private async collectHealthData(): Promise<SystemHealthData> {
        // Check notification permission
        const notificationsEnabled = 'Notification' in window && Notification.permission === 'granted';
        
        // Check if sound is enabled (check localStorage or default to true if notifications enabled)
        const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
        
        // Check browser support
        const browserSupport = 'Notification' in window && 'serviceWorker' in navigator;

        // Check online status
        const isOnline = navigator.onLine;

        // Get browser version
        const browserVersion = this.getBrowserVersion();

        // Get device type
        const deviceType = this.getDeviceType();

        // Check connection quality
        const connectionQuality = await this.getConnectionQuality();

        // Get last message sent time from localStorage
        const lastMessageSent = localStorage.getItem('lastMessageSent') || 'Never';

        return {
            memberId: this.memberId!,
            notificationsEnabled,
            soundEnabled,
            browserSupport,
            isOnline,
            browserVersion,
            deviceType,
            connectionQuality,
            lastMessageSent
        };
    }

    /**
     * Get browser version
     */
    private getBrowserVersion(): string {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        let version = 'Unknown';

        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browserName = 'Chrome';
            const match = userAgent.match(/Chrome\/(\d+)/);
            version = match ? match[1] : 'Unknown';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserName = 'Safari';
            const match = userAgent.match(/Version\/(\d+)/);
            version = match ? match[1] : 'Unknown';
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
            const match = userAgent.match(/Firefox\/(\d+)/);
            version = match ? match[1] : 'Unknown';
        } else if (userAgent.includes('Edg')) {
            browserName = 'Edge';
            const match = userAgent.match(/Edg\/(\d+)/);
            version = match ? match[1] : 'Unknown';
        }

        return `${browserName} ${version}`;
    }

    /**
     * Get device type
     */
    private getDeviceType(): string {
        const userAgent = navigator.userAgent;
        
        if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
            if (/iPad|Tablet/i.test(userAgent)) {
                return 'Tablet';
            }
            return 'Mobile';
        }
        return 'Desktop';
    }

    /**
     * Check connection quality
     */
    private async getConnectionQuality(): Promise<'excellent' | 'good' | 'poor' | 'offline'> {
        if (!navigator.onLine) {
            return 'offline';
        }

        // Check if Network Information API is available
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        
        if (connection) {
            const effectiveType = connection.effectiveType;
            
            switch (effectiveType) {
                case '4g':
                    return 'excellent';
                case '3g':
                    return 'good';
                case '2g':
                case 'slow-2g':
                    return 'poor';
                default:
                    return 'good';
            }
        }

        // Fallback: Test connection speed with a simple ping
        try {
            const startTime = Date.now();
            await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
            const latency = Date.now() - startTime;

            if (latency < 100) return 'excellent';
            if (latency < 300) return 'good';
            return 'poor';
        } catch (error) {
            return 'poor';
        }
    }

    /**
     * Log notification received (call this when member receives a notification)
     */
    async logNotificationReceived(notificationId: string) {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                'notification_logs',
                notificationId,
                {
                    receivedAt: new Date().toISOString(),
                    deviceInfo: this.getDeviceType()
                }
            );
            console.log('✅ Notification receipt logged');
        } catch (error) {
            console.error('❌ Failed to log notification receipt:', error);
        }
    }

    /**
     * Log booking acknowledged (call this when member acknowledges a booking)
     */
    async logBookingAcknowledged(bookingId: string) {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                'bookings',
                bookingId,
                {
                    providerAcknowledged: true,
                    acknowledgedAt: new Date().toISOString()
                }
            );
            console.log('✅ Booking acknowledgment logged');
        } catch (error) {
            console.error('❌ Failed to log booking acknowledgment:', error);
        }
    }

    /**
     * Test notification system (sends a test notification and logs it)
     */
    async testNotificationSystem(): Promise<boolean> {
        try {
            // Check if notifications are supported and permitted
            if (!('Notification' in window)) {
                console.error('❌ Notifications not supported');
                return false;
            }

            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.error('❌ Notification permission denied');
                    return false;
                }
            }

            // Send test notification
            const notification = new Notification('🔔 System Test', {
                body: 'Your notification system is working correctly!',
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                tag: 'system-test',
                requireInteraction: true,
                silent: false // This should play sound
            });

            // Play notification sound
            this.playNotificationSound();

            notification.onclick = () => {
                console.log('✅ Test notification clicked');
                notification.close();
            };

            return true;
        } catch (error) {
            console.error('❌ Notification test failed:', error);
            return false;
        }
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
        if (!soundEnabled) return;

        try {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.7;
            audio.play().catch(error => {
                console.error('❌ Failed to play notification sound:', error);
            });
        } catch (error) {
            console.error('❌ Failed to create audio:', error);
        }
    }
}

export const systemHealthService = new SystemHealthService();

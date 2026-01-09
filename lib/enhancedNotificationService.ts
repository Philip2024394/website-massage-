/**
 * Enhanced Notification Service for Critical Booking Alerts
 * Implements escalating notifications and stronger vibration patterns
 */

interface EscalatingNotificationConfig {
    title: string;
    body: string;
    bookingId?: string;
    therapistId?: string;
    urgencyLevel?: 'normal' | 'high' | 'critical';
}

export class EnhancedNotificationService {
    private static escalatingTimers: Map<string, NodeJS.Timeout[]> = new Map();
    private static isServiceWorkerReady: boolean = false;

    /**
     * Initialize the enhanced notification system
     */
    static async initialize(): Promise<boolean> {
        try {
            // Register service worker if not already registered
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('/sw-push.js');
                this.isServiceWorkerReady = true;
                console.log('✅ Enhanced notification service worker registered');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Failed to initialize enhanced notifications:', error);
            return false;
        }
    }

    /**
     * Request notification permission with aggressive approach
     */
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('⚠️ This browser does not support notifications');
            return false;
        }

        let permission = Notification.permission;

        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
            return true;
        } else {
            console.warn('❌ Notification permission denied');
            // Still return true - we'll show in-app alerts
            return false;
        }
    }

    /**
     * Show escalating notifications (3 notifications over 2 minutes)
     */
    static async showEscalatingNotifications(config: EscalatingNotificationConfig): Promise<void> {
        const notificationId = config.bookingId || `notification-${Date.now()}`;
        
        // Clear any existing escalating notifications for this ID
        this.stopEscalatingNotifications(notificationId);

        const timers: NodeJS.Timeout[] = [];

        // Immediate notification (aggressive)
        await this.showEnhancedNotification({
            title: `🚨 ${config.title}`,
            body: config.body,
            urgency: 'critical',
            vibrationPattern: [500, 200, 500, 200, 500], // Strong vibration
            requireInteraction: true
        });

        // Second notification after 30 seconds (more aggressive)
        const timer1 = setTimeout(async () => {
            await this.showEnhancedNotification({
                title: `⏰ URGENT: ${config.title}`,
                body: `${config.body}\n⚠️ RESPOND WITHIN 90 SECONDS!`,
                urgency: 'critical',
                vibrationPattern: [300, 100, 300, 100, 300, 100, 300], // Longer vibration
                requireInteraction: true
            });
        }, 30000); // 30 seconds

        // Final notification after 90 seconds (most aggressive)
        const timer2 = setTimeout(async () => {
            await this.showEnhancedNotification({
                title: `🔥 FINAL NOTICE: ${config.title}`,
                body: `${config.body}\n🚨 BOOKING EXPIRES IN 30 SECONDS!`,
                urgency: 'critical',
                vibrationPattern: [200, 100, 200, 100, 200, 100, 200, 100, 200], // Very long vibration
                requireInteraction: true
            });
        }, 90000); // 90 seconds

        timers.push(timer1, timer2);
        this.escalatingTimers.set(notificationId, timers);

        // Auto-cleanup after 2 minutes
        setTimeout(() => {
            this.stopEscalatingNotifications(notificationId);
        }, 120000);
    }

    /**
     * Stop escalating notifications for a specific ID
     */
    static stopEscalatingNotifications(notificationId: string): void {
        const timers = this.escalatingTimers.get(notificationId);
        if (timers) {
            timers.forEach(timer => clearTimeout(timer));
            this.escalatingTimers.delete(notificationId);
            console.log(`🛑 Stopped escalating notifications for: ${notificationId}`);
        }
    }

    /**
     * Show enhanced notification with stronger patterns
     */
    private static async showEnhancedNotification(options: {
        title: string;
        body: string;
        urgency?: 'normal' | 'high' | 'critical';
        vibrationPattern?: number[];
        requireInteraction?: boolean;
    }): Promise<void> {
        const { title, body, urgency = 'normal', vibrationPattern, requireInteraction = false } = options;

        try {
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                const notification = new Notification(title, {
                    body,
                    icon: '/icons/app-icon-192.png',
                    badge: '/icons/badge-icon.png',
                    tag: 'indastreet-booking-alert',
                    requireInteraction,
                    vibrate: vibrationPattern || [200, 100, 200],
                    timestamp: Date.now(),
                    data: { urgency, timestamp: Date.now() }
                });

                // Auto-close after 10 seconds for non-critical
                if (urgency !== 'critical') {
                    setTimeout(() => notification.close(), 10000);
                }

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            }

            // Always vibrate if supported (works even without notification permission)
            if ('vibrate' in navigator && vibrationPattern) {
                navigator.vibrate(vibrationPattern);
                console.log('📳 Enhanced vibration triggered');
            }

            // Play enhanced sound (if app is active)
            await this.playEnhancedSound(urgency);

            console.log(`🔔 Enhanced notification shown: ${urgency} level`);

        } catch (error) {
            console.error('❌ Error showing enhanced notification:', error);
        }
    }

    /**
     * Play enhanced notification sound based on urgency
     */
    private static async playEnhancedSound(urgency: 'normal' | 'high' | 'critical'): Promise<void> {
        try {
            const soundFile = '/sounds/booking-notification.mp3'; // Use same sound for all notifications
            let playCount = 1;

            switch (urgency) {
                case 'high':
                    playCount = 2; // Play twice for urgency
                    break;
                case 'critical':
                    playCount = 3; // Play three times for critical
                    break;
            }

            // Play sound multiple times for higher urgency
            for (let i = 0; i < playCount; i++) {
                const audio = new Audio(soundFile);
                audio.volume = 1.0; // Maximum volume
                await audio.play();
                
                if (i < playCount - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300)); // Small gap between plays
                }
            }

            console.log(`🔊 Enhanced sound played: ${urgency} (${playCount}x)`);

        } catch (error) {
            console.warn('⚠️ Could not play enhanced sound:', error);
        }
    }

    /**
     * Show booking notification with escalating alerts
     */
    static async showBookingNotification(bookingData: {
        bookingId: string;
        customerName: string;
        serviceType: string;
        duration: string;
        location: string;
    }): Promise<void> {
        await this.showEscalatingNotifications({
            title: 'NEW BOOKING REQUEST',
            body: `${bookingData.customerName} wants ${bookingData.serviceType} (${bookingData.duration}) at ${bookingData.location}`,
            bookingId: bookingData.bookingId,
            urgencyLevel: 'critical'
        });
    }

    /**
     * Test the enhanced notification system
     */
    static async testEnhancedNotifications(): Promise<void> {
        console.log('🧪 Testing enhanced notification system...');
        
        await this.showEscalatingNotifications({
            title: 'TEST NOTIFICATION',
            body: 'This is a test of the enhanced notification system with escalating alerts.',
            urgencyLevel: 'critical'
        });
        
        console.log('✅ Enhanced notification test initiated');
    }

    /**
     * Cleanup all escalating notifications
     */
    static cleanup(): void {
        this.escalatingTimers.forEach((timers, notificationId) => {
            this.stopEscalatingNotifications(notificationId);
        });
        console.log('🧹 Enhanced notification service cleaned up');
    }
}

export default EnhancedNotificationService;
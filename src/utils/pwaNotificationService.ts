/**
 * PWA Push Notification Service
 * TRUE background notifications that work even when phone is closed
 */

export const pwaNotificationService = {
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    },

    async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('🔧 Service Worker registered:', registration);
                return registration;
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
                return null;
            }
        }
        return null;
    },

    async subscribeToPushNotifications(): Promise<PushSubscription | null> {
        const registration = await this.registerServiceWorker();
        if (!registration) return null;

        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Need to generate
            });

            console.log('🔔 Push subscription created:', subscription);
            
            // Send subscription to your server
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            return subscription;
        } catch (error) {
            console.error('❌ Push subscription failed:', error);
            return null;
        }
    },

    async sendBackgroundNotification(therapistId: string, message: string) {
        // This would be called from your server when booking is created
        // Server sends push notification to therapist's device
        // Works even when phone is closed!
        
        const payload = {
            title: '🏨 New Booking Request!',
            body: message,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            vibrate: [100, 50, 100],
            data: {
                therapistId,
                type: 'booking',
                timestamp: Date.now()
            },
            actions: [
                { action: 'view', title: 'View Booking' },
                { action: 'dismiss', title: 'Dismiss' }
            ]
        };

        // Server API would send this to the device
        return payload;
    }
};

export default pwaNotificationService;
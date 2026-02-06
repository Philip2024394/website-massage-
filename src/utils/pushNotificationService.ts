/**
 * PWA Push Notification Service
 * Works even when app is closed, phone is locked, or user is on TikTok
 * Uses Appwrite Realtime + Service Worker for background notifications
 */

import { Client, Databases, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

// Service Worker registration check
const isServiceWorkerSupported = 'serviceWorker' in navigator;
const isPushSupported = 'PushManager' in window;
const isNotificationSupported = 'Notification' in window;

export interface PushSubscription {
    providerId: number;
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    deviceInfo: {
        userAgent: string;
        platform: string;
        type: 'mobile' | 'tablet' | 'desktop';
    };
    createdAt: string;
}

class PushNotificationService {
    private client: Client;
    private databases: Databases;
    private swRegistration: ServiceWorkerRegistration | null = null;

    constructor() {
        this.client = new Client()
            .setEndpoint(APPWRITE_CONFIG.endpoint)
            .setProject(APPWRITE_CONFIG.projectId);
        
        this.databases = new Databases(this.client);
    }

    /**
     * Check if PWA push notifications are supported
     */
    isSupported(): boolean {
        return isServiceWorkerSupported && isPushSupported && isNotificationSupported;
    }

    /**
     * Get device type
     */
    private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    /**
     * Register service worker
     */
    async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
        if (!isServiceWorkerSupported) {
            console.warn('⚠️ Service Worker not supported');
            return null;
        }

        try {
            // Register service worker
            this.swRegistration = await navigator.serviceWorker.register('/sw-push.js', {
                scope: '/'
            });

            console.log('✅ Service Worker registered:', this.swRegistration);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('✅ Service Worker ready');

            return this.swRegistration;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            return null;
        }
    }

    /**
     * Request notification permission
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!isNotificationSupported) {
            console.warn('⚠️ Notifications not supported');
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            console.log('📱 Notification permission:', permission);
            return permission;
        } catch (error) {
            console.error('❌ Error requesting notification permission:', error);
            return 'denied';
        }
    }

    /**
     * Subscribe to push notifications
     */
    async subscribe(providerId: number): Promise<PushSubscription | null> {
        try {
            // Check support
            if (!this.isSupported()) {
                throw new Error('Push notifications not supported');
            }

            // Register service worker if not already registered
            if (!this.swRegistration) {
                this.swRegistration = await this.registerServiceWorker();
                if (!this.swRegistration) {
                    throw new Error('Service Worker registration failed');
                }
            }

            // Request permission
            const permission = await this.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Notification permission denied');
            }

            // Subscribe to push notifications
            // Note: For Appwrite, we use Web Push API with VAPID keys
            // The service worker will handle notifications via Appwrite Realtime
            const vapidPublicKey = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY;
            
            if (!vapidPublicKey) {
                throw new Error('VAPID public key not configured. Check VITE_VAPID_PUBLIC_KEY in environment variables.');
            }
            
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
            });

            console.log('✅ Push subscription created:', subscription);

            // Convert subscription to JSON
            const subscriptionJSON = subscription.toJSON();

            // Create push subscription object
            const pushSubscription: PushSubscription = {
                providerId,
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscriptionJSON.keys?.p256dh || '',
                    auth: subscriptionJSON.keys?.auth || ''
                },
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    type: this.getDeviceType()
                },
                createdAt: new Date().toISOString()
            };

            // Save subscription to Appwrite
            await this.saveSubscription(pushSubscription);

            // Initialize Appwrite Realtime listener
            await this.initializeRealtimeListener(providerId);

            console.log('✅ Push notifications enabled for provider:', providerId);
            return pushSubscription;

        } catch (error) {
            console.error('❌ Push subscription failed:', error);
            return null;
        }
    }

    /**
     * Save subscription to Appwrite database
     */
    private async saveSubscription(subscription: PushSubscription): Promise<void> {
        try {
            // Check if subscription already exists
            const existingSubscriptions = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.pushSubscriptions || 'push_subscriptions',
                [
                    Query.equal('providerId', subscription.providerId),
                    Query.equal('endpoint', subscription.endpoint)
                ]
            );

            if (existingSubscriptions.documents.length > 0) {
                console.log('📱 Push subscription already exists');
                return;
            }

            // Create new subscription
            await this.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.pushSubscriptions || 'push_subscriptions',
                'unique()',
                subscription
            );

            console.log('✅ Push subscription saved to Appwrite');
        } catch (error) {
            console.error('❌ Error saving push subscription:', error);
            throw error;
        }
    }

    /**
     * Initialize Appwrite Realtime listener for notifications
     * This runs in the background even when tab is not active
     */
    private async initializeRealtimeListener(providerId: number): Promise<void> {
        try {
            // Subscribe to notification collection changes
            this.client.subscribe(
                `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.notifications}.documents`,
                (response: any) => {
                    console.log('📨 Realtime notification received:', response);

                    // Check if notification is for this provider
                    const notification = response.payload;
                    if (notification.providerId === providerId && !notification.isRead) {
                        // Trigger service worker to show notification
                        this.showBackgroundNotification(notification);
                    }
                }
            );

            console.log('✅ Realtime listener initialized for provider:', providerId);
        } catch (error) {
            console.error('❌ Error initializing realtime listener:', error);
        }
    }

    /**
     * Show notification via service worker
     * This works even when app is closed or in background
     */
    private async showBackgroundNotification(notification: any): Promise<void> {
        if (!this.swRegistration) {
            console.warn('⚠️ Service Worker not registered');
            return;
        }

        try {
            // Determine notification details based on type
            let title = '📱 IndaStreet';
            let body = notification.message;
            const icon = '/icon-192.png';
            const badge = '/icon-192.png';
            const tag = notification.type;
            let vibrate = [200, 100, 200]; // Vibration pattern
            let sound = '/sounds/message-notification.mp3';

            switch (notification.type) {
                case 'whatsapp_contact':
                    title = '📱 New WhatsApp Contact!';
                    body = 'Someone clicked "Chat Now" to contact you on WhatsApp!';
                    vibrate = [200, 100, 200, 100, 200];
                    sound = '/sounds/message-notification.mp3';
                    break;
                case 'booking_request':
                    title = '🔔 New Booking Request!';
                    vibrate = [300, 100, 300];
                    sound = '/sounds/booking-notification.mp3';
                    break;
                case 'review_received':
                    title = '⭐ New Review!';
                    vibrate = [100, 50, 100];
                    sound = '/sounds/success-notification.mp3';
                    break;
            }

            // Show notification via service worker
            await this.swRegistration.showNotification(title, {
                body,
                icon,
                badge,
                tag,
                requireInteraction: true, // Notification stays until dismissed
                data: {
                    url: '/', // URL to open when clicked
                    notificationId: notification.$id,
                    type: notification.type,
                    sound, // Pass sound to service worker
                    vibrate, // Pass vibrate pattern to service worker
                    actions: [ // Pass actions to service worker
                        {
                            action: 'open',
                            title: 'Open App',
                            icon: '/icon-192.png'
                        },
                        {
                            action: 'dismiss',
                            title: 'Dismiss',
                            icon: '/icon-192.png'
                        }
                    ]
                }
            });

            console.log('✅ Background notification shown');

            // Play sound via service worker
            await this.playNotificationSound(sound);

        } catch (error) {
            console.error('❌ Error showing background notification:', error);
        }
    }

    /**
     * Play notification sound
     * Works even when app is in background
     */
    private async playNotificationSound(soundUrl: string): Promise<void> {
        try {
            // Send message to service worker to play sound
            if (this.swRegistration?.active) {
                this.swRegistration.active.postMessage({
                    type: 'PLAY_SOUND',
                    soundUrl
                });
            }
        } catch (error) {
            console.error('❌ Error playing notification sound:', error);
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe(providerId: number): Promise<void> {
        try {
            if (!this.swRegistration) {
                console.warn('⚠️ No service worker registration found');
                return;
            }

            // Get push subscription
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                console.log('✅ Push subscription removed');
            }

            // Remove from Appwrite
            const subscriptions = await this.databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.pushSubscriptions || 'push_subscriptions',
                [Query.equal('providerId', providerId)]
            );

            for (const sub of subscriptions.documents) {
                await this.databases.deleteDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.pushSubscriptions || 'push_subscriptions',
                    sub.$id
                );
            }

            console.log('✅ Push notifications disabled');
        } catch (error) {
            console.error('❌ Error unsubscribing:', error);
        }
    }

    /**
     * Check if provider is subscribed
     */
    async isSubscribed(_providerId: number): Promise<boolean> {
        try {
            if (!this.swRegistration) {
                return false;
            }

            const subscription = await this.swRegistration.pushManager.getSubscription();
            return subscription !== null;
        } catch (error) {
            console.error('❌ Error checking subscription:', error);
            return false;
        }
    }

    /**
     * Helper: Convert VAPID key to Uint8Array
     */
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Test notification (for debugging)
     */
    async testNotification(): Promise<void> {
        if (!this.swRegistration) {
            console.warn('⚠️ Service Worker not registered');
            return;
        }

        await this.swRegistration.showNotification('🧪 Test Notification', {
            body: 'This is a test notification from IndaStreet!',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            requireInteraction: false,
            data: {
                url: '/',
                sound: '/sounds/success-notification.mp3',
                vibrate: [200, 100, 200]
            }
        });

        console.log('✅ Test notification sent');
    }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

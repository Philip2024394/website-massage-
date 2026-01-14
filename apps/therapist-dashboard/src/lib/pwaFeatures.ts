// Type extensions for PWA features
declare global {
    interface Navigator {
        standalone?: boolean;
    }
    interface ServiceWorkerRegistration {
        sync?: any;
    }
}

/**
 * 📱 PWA Enhanced Features for Therapist Dashboard
 * Provides persistent chat functionality and app-like experience
 */

// Detect if running as PWA
export const isPWAMode = (): boolean => {
    // Check for standalone mode
    if (window.navigator?.standalone === true) {
        return true; // iOS PWA
    }
    
    // Check display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true; // Android/Desktop PWA
    }
    
    // Check if launched from home screen (Android)
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return true;
    }
    
    return false;
};

// PWA Installation Detection
export const isPWAInstallable = (): boolean => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Chat Persistence Manager
export class ChatPersistenceManager {
    private static STORAGE_KEY = 'therapist_chat_state';
    
    static saveChatState(therapistId: string, state: {
        isOpen: boolean;
        isMinimized: boolean;
        unreadCount: number;
        lastMessageTime?: string;
    }): void {
        try {
            const chatStates = this.getAllChatStates();
            chatStates[therapistId] = {
                ...state,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chatStates));
        } catch (error) {
            console.warn('Failed to save chat state:', error);
        }
    }
    
    static getChatState(therapistId: string): {
        isOpen: boolean;
        isMinimized: boolean;
        unreadCount: number;
        lastMessageTime?: string;
        lastUpdated?: string;
    } | null {
        try {
            const chatStates = this.getAllChatStates();
            return chatStates[therapistId] || null;
        } catch (error) {
            console.warn('Failed to get chat state:', error);
            return null;
        }
    }
    
    static clearChatState(therapistId: string): void {
        try {
            const chatStates = this.getAllChatStates();
            delete chatStates[therapistId];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chatStates));
        } catch (error) {
            console.warn('Failed to clear chat state:', error);
        }
    }
    
    private static getAllChatStates(): Record<string, any> {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            return {};
        }
    }
}

// PWA Badge Manager (for unread counts)
export class PWABadgeManager {
    static async updateBadge(count: number): Promise<void> {
        try {
            // Set app badge if supported (Chrome 81+)
            if ('setAppBadge' in navigator) {
                if (count > 0) {
                    await (navigator as any).setAppBadge(count);
                } else {
                    await (navigator as any).clearAppBadge();
                }
            }
            
            // Fallback: Update page title
            if (count > 0) {
                document.title = `(${count}) IndaStreet Therapist`;
            } else {
                document.title = 'IndaStreet Therapist';
            }
        } catch (error) {
            console.warn('Failed to update badge:', error);
        }
    }
    
    static async clearBadge(): Promise<void> {
        await this.updateBadge(0);
    }
}

// Enhanced PWA Notification Manager with Background Message Checking
export class PWANotificationManager {
    private static vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIoj7ntT_UDlI9LdqPDp1x4yB9l6F2H3J8fPnLixchMuaNy7k6gH0'; // Valid VAPID key for web push
    private static instance: PWANotificationManager;
    private static messageCheckStarted = false;
    private static currentTherapistId: string | null = null;

    // Singleton pattern for better state management
    static getInstance(): PWANotificationManager {
        if (!PWANotificationManager.instance) {
            PWANotificationManager.instance = new PWANotificationManager();
        }
        return PWANotificationManager.instance;
    }
    
    // Initialize PWA features for a specific therapist
    static async init(therapistId?: string): Promise<void> {
        console.log('🔄 Initializing PWA notification system...');
        
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
            console.warn('⚠️ PWA features not supported in this browser');
            return;
        }

        try {
            // Request notification permission
            const hasPermission = await this.requestPermission();
            
            if (hasPermission && therapistId) {
                // Register push subscription
                await this.registerPushSubscription(therapistId);
                
                // Start background message checking
                await this.startBackgroundMessageCheck(therapistId);
            }

        } catch (error) {
            console.error('❌ Error initializing PWA notifications:', error);
        }
    }

    // Start background message checking via service worker
    static async startBackgroundMessageCheck(therapistId: string, checkInterval = 30000): Promise<void> {
        if (this.messageCheckStarted || !('serviceWorker' in navigator)) {
            return;
        }

        try {
            console.log(`🔄 Starting background message check for therapist ${therapistId}`);
            
            const registration = await navigator.serviceWorker.ready;
            
            if (registration.active) {
                // Send message to service worker to start checking
                registration.active.postMessage({
                    type: 'START_MESSAGE_CHECK',
                    therapistId,
                    interval: checkInterval
                });
                
                this.messageCheckStarted = true;
                this.currentTherapistId = therapistId;
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);
            }
            
        } catch (error) {
            console.error('Error starting background message check:', error);
        }
    }

    // Handle messages from service worker
    private static handleServiceWorkerMessage = (event: MessageEvent): void => {
        const { type, payload } = event.data;
        
        switch (type) {
            case 'NEW_CHAT_MESSAGE':
                console.log('📨 Received new chat message from service worker:', payload);
                // Emit event for components to handle
                window.dispatchEvent(new CustomEvent('newChatMessage', { detail: payload }));
                break;
                
            default:
                console.log('Unknown service worker message:', event.data);
        }
    }

    // Stop background message checking
    static async stopBackgroundMessageCheck(): Promise<void> {
        if (!this.messageCheckStarted || !('serviceWorker' in navigator)) {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            if (registration.active) {
                registration.active.postMessage({
                    type: 'STOP_MESSAGE_CHECK'
                });
            }
            
            this.messageCheckStarted = false;
            this.currentTherapistId = null;
            
            // Remove event listener
            navigator.serviceWorker.removeEventListener('message', this.handleServiceWorkerMessage);
            
        } catch (error) {
            console.error('Error stopping background message check:', error);
        }
    }

    // ===== BOOKING NOTIFICATION SYSTEM =====

    // Show booking notification with multi-layer alerts
    static async showBookingNotification(booking: {
        id: string;
        customerName: string;
        serviceType: string;
        duration: number;
        location: string;
        date: string;
        time: string;
        status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
        therapistId: string;
    }): Promise<void> {
        console.log('🔔 Showing booking notification:', booking);
        
        // Vibration for new bookings
        if ('vibrate' in navigator && booking.status === 'pending') {
            navigator.vibrate([200, 100, 200, 100, 400]);
        }
        
        const notificationTitle = this.getBookingNotificationTitle(booking.status);
        const notificationBody = this.getBookingNotificationBody(booking);
        
        // Show push notification
        if (await this.requestPermission()) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(notificationTitle, {
                    body: notificationBody,
                    icon: '/pwa-icon-192.png',
                    badge: '/pwa-icon-192.png',
                    tag: `booking-${booking.id}`,
                    requireInteraction: true,
                    vibrate: [200, 100, 200, 100, 400],
                    renotify: true,
                    data: {
                        type: 'booking-notification',
                        action: 'open-booking-details',
                        bookingId: booking.id,
                        therapistId: booking.therapistId,
                        status: booking.status,
                        url: `/?action=open-booking&id=${booking.id}`
                    },
                    // actions: [
                        {
                            action: 'accept-booking',
                            title: '✅ Accept',
                            icon: '/icons/accept.png'
                        },
                        {
                            action: 'view-details',
                            title: '👁️ View Details',
                            icon: '/icons/view.png'
                        },
                        {
                            action: 'dismiss',
                            title: 'Dismiss'
                        }
                    ]
                });
            } catch (error) {
                console.warn('Service worker notification failed, falling back:', error);
                
                // Fallback to basic notification
                new Notification(notificationTitle, {
                    body: notificationBody,
                    icon: '/pwa-icon-192.png',
                    tag: `booking-${booking.id}`,
                    requireInteraction: true,
                    data: {
                        type: 'booking-notification',
                        bookingId: booking.id,
                        therapistId: booking.therapistId,
                        status: booking.status
                    }
                });
            }
        }
        
        // Trigger persistent visual alert
        await this.triggerPersistentBookingAlert(booking);
        
        // Update booking badge
        await this.updateBookingBadge();
        
        // Play continuous alert sound for pending bookings
        if (booking.status === 'pending') {
            this.playContinuousBookingAlert(booking.id);
        }
    }
    
    // Trigger persistent visual alert that shows until acknowledged
    static async triggerPersistentBookingAlert(booking: any): Promise<void> {
        const alertData = {
            id: booking.id,
            type: 'booking-alert',
            priority: booking.status === 'pending' ? 'high' : 'normal',
            title: this.getBookingNotificationTitle(booking.status),
            message: this.getBookingNotificationBody(booking),
            booking: booking,
            timestamp: Date.now(),
            acknowledged: false
        };
        
        // Store in localStorage for persistence across app restarts
        const existingAlerts = JSON.parse(localStorage.getItem('persistent_booking_alerts') || '[]');
        existingAlerts.push(alertData);
        localStorage.setItem('persistent_booking_alerts', JSON.stringify(existingAlerts));
        
        // Dispatch event for components to handle
        window.dispatchEvent(new CustomEvent('persistentBookingAlert', {
            detail: alertData
        }));
    }
    
    // Get all unacknowledged booking alerts
    static getPersistentBookingAlerts(): any[] {
        const alerts = JSON.parse(localStorage.getItem('persistent_booking_alerts') || '[]');
        return alerts.filter((alert: any) => !alert.acknowledged);
    }
    
    // Acknowledge a specific booking alert
    static acknowledgeBookingAlert(alertId: string): void {
        const alerts = JSON.parse(localStorage.getItem('persistent_booking_alerts') || '[]');
        const updatedAlerts = alerts.map((alert: any) => {
            if (alert.id === alertId) {
                return { ...alert, acknowledged: true, acknowledgedAt: Date.now() };
            }
            return alert;
        });
        localStorage.setItem('persistent_booking_alerts', JSON.stringify(updatedAlerts));
        
        // Stop continuous alert for this booking
        this.stopContinuousBookingAlert(alertId);
        
        // Update booking badge
        this.updateBookingBadge();
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('bookingAlertAcknowledged', {
            detail: { alertId }
        }));
    }
    
    // Update booking count badge
    static async updateBookingBadge(): Promise<void> {
        const unacknowledgedAlerts = this.getPersistentBookingAlerts();
        const pendingBookings = unacknowledgedAlerts.filter(alert => 
            alert.booking?.status === 'pending'
        );
        
        const badgeCount = pendingBookings.length;
        
        try {
            // Set app badge if supported (Chrome 81+)
            if ('setAppBadge' in navigator && badgeCount > 0) {
                await (navigator as any).setAppBadge(badgeCount);
            } else if ('clearAppBadge' in navigator) {
                await (navigator as any).clearAppBadge();
            }
            
            // Update page title
            if (badgeCount > 0) {
                document.title = `(${badgeCount}) IndaStreet Therapist - New Bookings!`;
            } else {
                document.title = 'IndaStreet Therapist';
            }
            
            // Dispatch event for components to update their badges
            window.dispatchEvent(new CustomEvent('bookingBadgeUpdate', {
                detail: { count: badgeCount, pendingBookings }
            }));
            
        } catch (error) {
            console.warn('Failed to update booking badge:', error);
        }
    }
    
    // Play continuous alert sound for urgent bookings
    private static continuousAlerts: Map<string, any> = new Map();
    
    static playContinuousBookingAlert(bookingId: string): void {
        // Only play for pending bookings to avoid annoying therapists
        if (this.continuousAlerts.has(bookingId)) {
            return; // Already playing
        }
        
        try {
            const audio = new Audio('/sounds/booking-notification.mp3');
            audio.loop = false; // We'll control the loop manually
            audio.volume = 0.8;
            
            // Play every 10 seconds until acknowledged
            const playInterval = setInterval(() => {
                if (audio.paused) {
                    audio.play().catch(err => {
                        console.warn('Failed to play booking alert:', err);
                    });
                }
            }, 10000); // Every 10 seconds
            
            // Store reference
            this.continuousAlerts.set(bookingId, {
                audio,
                interval: playInterval,
                startTime: Date.now()
            });
            
            // Auto-stop after 10 minutes to avoid infinite alerts
            setTimeout(() => {
                this.stopContinuousBookingAlert(bookingId);
            }, 10 * 60 * 1000); // 10 minutes
            
        } catch (error) {
            console.warn('Failed to setup continuous booking alert:', error);
        }
    }
    
    static stopContinuousBookingAlert(bookingId: string): void {
        const alert = this.continuousAlerts.get(bookingId);
        if (alert) {
            if (alert.audio) {
                alert.audio.pause();
                alert.audio.currentTime = 0;
            }
            if (alert.interval) {
                clearInterval(alert.interval);
            }
            this.continuousAlerts.delete(bookingId);
            console.log(`🔕 Stopped continuous alert for booking ${bookingId}`);
        }
    }
    
    // Stop all continuous alerts
    static stopAllContinuousAlerts(): void {
        this.continuousAlerts.forEach((alert, bookingId) => {
            this.stopContinuousBookingAlert(bookingId);
        });
    }
    
    // Helper methods for notification content
    private static getBookingNotificationTitle(status: string): string {
        const titles: Record<string, string> = {
            pending: '🆕 New Booking Request!',
            confirmed: '✅ Booking Confirmed',
            completed: '🎉 Booking Completed',
            cancelled: '❌ Booking Cancelled'
        };
        return titles[status] || 'Booking Update';
    }
    
    private static getBookingNotificationBody(booking: any): string {
        switch (booking.status) {
            case 'pending':
                return `${booking.customerName} requested ${booking.duration}min ${booking.serviceType} at ${booking.location}. Tap to respond!`;
            case 'confirmed':
                return `Booking with ${booking.customerName} on ${booking.date} at ${booking.time} is confirmed.`;
            case 'completed':
                return `Service for ${booking.customerName} has been completed. Well done!`;
            case 'cancelled':
                return `Booking with ${booking.customerName} has been cancelled.`;
            default:
                return `Booking update for ${booking.customerName}.`;
        }
    }
    
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            return false;
        }
        
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    // Cleanup method for app shutdown
    static cleanup(): void {
        console.log('🧹 Cleaning up PWA notification system...');
        
        // Stop all continuous booking alerts
        this.stopAllContinuousAlerts();
        
        // Clear app badge
        if ('clearAppBadge' in navigator) {
            (navigator as any).clearAppBadge().catch(() => {});
        }
        
        // Reset title
        document.title = 'IndaStreet Therapist';
        
        console.log('✅ PWA notification cleanup complete');
    }
    
    static async registerPushSubscription(therapistId: string): Promise<void> {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();
            
            if (existingSubscription) {
                console.log('✅ Push subscription already exists');
                // Store subscription for this therapist
                this.storePushSubscription(therapistId, existingSubscription);
                return;
            }
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as any || this.urlBase64ToUint8Array(this.vapidPublicKey)
            });
            
            console.log('✅ Push subscription created:', subscription);
            
            // Store and send subscription to server
            this.storePushSubscription(therapistId, subscription);
            await this.sendSubscriptionToServer(therapistId, subscription);
            
        } catch (error) {
            console.error('Failed to register push subscription:', error);
        }
    }
    
    private static urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    
    private static storePushSubscription(therapistId: string, subscription: PushSubscription): void {
        localStorage.setItem(`push_subscription_${therapistId}`, JSON.stringify(subscription));
    }
    
    private static async sendSubscriptionToServer(therapistId: string, subscription: PushSubscription): Promise<void> {
        try {
            // Send subscription to your backend to store for sending push notifications
            const response = await fetch('/api/push-subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    therapistId,
                    subscription
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send subscription to server');
            }
            
            console.log('✅ Push subscription sent to server');
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
        }
    }
    
    static async showChatNotification(message: {
        title: string;
        body: string;
        icon?: string;
        tag?: string;
        messageId?: string;
        therapistId?: string;
    }): Promise<void> {
        if (!await this.requestPermission()) {
            return;
        }
        
        // Use service worker registration for persistent notifications
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(message.title, {
                    body: message.body,
                    icon: message.icon || '/pwa-icon-192.png',
                    badge: '/pwa-icon-192.png',
                    tag: message.tag || 'chat-message',
                    requireInteraction: true,
                    // vibrate: [200, 100, 200] // Not supported in type,
                    data: {
                        type: 'chat-message',
                        messageId: message.messageId,
                        therapistId: message.therapistId,
                        action: 'open-chat',
                        timestamp: Date.now(),
                        url: '/?action=open-chat'
                    },
                    // actions: [
                        {
                            action: 'open-chat',
                            title: 'Open Chat',
                            icon: '/pwa-icon-96.png'
                        },
                        {
                            action: 'dismiss',
                            title: 'Dismiss'
                        }
                    ]
                });
                return;
            } catch (error) {
                console.warn('Service worker notification failed, falling back to basic notification:', error);
            }
        }
        
        // Fallback to basic notification
        const notification = new Notification(message.title, {
            body: message.body,
            icon: message.icon || '/pwa-icon-192.png',
            tag: message.tag || 'chat-message',
            badge: '/pwa-icon-192.png',
            requireInteraction: true,
            data: {
                type: 'chat-message',
                messageId: message.messageId,
                therapistId: message.therapistId,
                action: 'open-chat',
                timestamp: Date.now()
            }
        });
        
        // Handle click for basic notification
        notification.onclick = () => {
            window.focus();
            notification.close();
            
            // Trigger chat open event
            window.dispatchEvent(new CustomEvent('pwa-open-chat', {
                detail: {
                    messageId: message.messageId,
                    therapistId: message.therapistId
                }
            }));
        };
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);
    }
}

// Background Sync for Chat Messages (when offline)
export class ChatBackgroundSync {
    static async registerBackgroundSync(): Promise<void> {
        if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
            console.log('Background sync not supported');
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('chat-messages-sync');
            console.log('✅ Background sync registered for chat messages');
        } catch (error) {
            console.warn('Failed to register background sync:', error);
        }
    }
    
    static queueOfflineMessage(message: any): void {
        try {
            const queue = this.getOfflineQueue();
            queue.push({
                ...message,
                timestamp: Date.now(),
                id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
            localStorage.setItem('chat_offline_queue', JSON.stringify(queue));
        } catch (error) {
            console.warn('Failed to queue offline message:', error);
        }
    }
    
    static getOfflineQueue(): any[] {
        try {
            const queue = localStorage.getItem('chat_offline_queue');
            return queue ? JSON.parse(queue) : [];
        } catch (error) {
            return [];
        }
    }
    
    static clearOfflineQueue(): void {
        localStorage.removeItem('chat_offline_queue');
    }
}

// PWA Lifecycle Manager
export class PWALifecycleManager {
    static init(therapistId?: string): void {
        // Register service worker if supported
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration);
                    
                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New version available
                                    this.showUpdatePrompt();
                                }
                            });
                        }
                    });
                    
                    // Initialize push notifications if therapist ID available
                    if (therapistId) {
                        PWANotificationManager.registerPushSubscription(therapistId);
                        PWANotificationManager.stopBackgroundMessageCheck(therapistId);
                    }
                })
                .catch(error => {
                    console.warn('Service Worker registration failed:', error);
                });
        }
        
        // Register background sync
        ChatBackgroundSync.registerBackgroundSync();
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && isPWAMode()) {
                // App became visible - check for new messages
                window.dispatchEvent(new CustomEvent('pwa-visibility-change', {
                    detail: { visible: true }
                }));
            } else if (document.hidden && therapistId) {
                // App went to background - ensure background checking is active
                PWANotificationManager.stopBackgroundMessageCheck(therapistId);
            }
        });
        
        // Handle PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('pwa-install-available', {
                detail: { prompt: e }
            }));
        });
        
        // Listen for service worker messages
        navigator.serviceWorker?.addEventListener('message', (event) => {
            if (event.data.type === 'NEW_CHAT_MESSAGE') {
                // Handle new message from service worker
                window.dispatchEvent(new CustomEvent('pwa-new-message', {
                    detail: event.data.payload
                }));
            }
        });
    }
    
    private static showUpdatePrompt(): void {
        if (confirm('A new version of the app is available. Update now?')) {
            window.location.reload();
        }
    }
}

export default {
    isPWAMode,
    isPWAInstallable,
    ChatPersistenceManager,
    PWABadgeManager,
    PWANotificationManager,
    ChatBackgroundSync,
    PWALifecycleManager
};

// Background Notification Service
// Handles notifications when app is closed or in background

export interface BackgroundNotificationConfig {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
    soundType?: 'booking' | 'chat' | 'coin' | 'general' | 'urgent' | 'success' | 'achievement';
    vibrate?: number[];
}

class BackgroundNotificationService {
    private swRegistration: ServiceWorkerRegistration | null = null;
    private isServiceWorkerSupported: boolean = false;

    constructor() {
        this.initializeServiceWorker();
    }

    private async initializeServiceWorker(): Promise<void> {
        if ('serviceWorker' in navigator) {
            try {
                this.isServiceWorkerSupported = true;
                await this.registerServiceWorker();
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
                this.isServiceWorkerSupported = false;
            }
        }
    }

    private async registerServiceWorker(): Promise<void> {
        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw-notifications.js', {
                scope: '/'
            });

            console.log('Service Worker registered successfully');

            // Listen for service worker messages
            navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

            // Update service worker if needed
            if (this.swRegistration.waiting) {
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }

        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    }

    private handleServiceWorkerMessage(event: MessageEvent): void {
        const { data } = event;
        
        switch (data.type) {
            case 'NOTIFICATION_CLICKED':
                this.handleNotificationClick(data.payload);
                break;
            case 'NOTIFICATION_CLOSED':
                console.log('Background notification closed:', data.payload);
                break;
            default:
                console.log('Unknown service worker message:', data);
        }
    }

    private handleNotificationClick(payload: any): void {
        // Handle notification click actions
        if (payload.action) {
            switch (payload.action) {
                case 'view_booking':
                    window.location.href = `/bookings/${payload.bookingId}`;
                    break;
                case 'open_chat':
                    window.location.href = `/chat/${payload.chatId}`;
                    break;
                case 'view_coins':
                    window.location.href = '/coins';
                    break;
                default:
                    window.location.href = '/';
            }
        } else {
            // Default action - bring app to foreground
            if (window.focus) {
                window.focus();
            }
        }
    }

    /**
     * Request notification permission
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission === 'denied') {
            return 'denied';
        }

        const permission = await Notification.requestPermission();
        return permission;
    }

    /**
     * Show background notification that works even when app is closed
     */
    async showBackgroundNotification(config: BackgroundNotificationConfig): Promise<void> {
        const permission = await this.requestPermission();
        
        if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        const notificationOptions: any = {
            body: config.body,
            icon: config.icon || '/icons/app-icon-192.png',
            badge: config.badge || '/icons/badge-icon.png',
            tag: config.tag || 'massage-app-notification',
            data: {
                ...config.data,
                soundType: config.soundType,
                timestamp: Date.now()
            },
            requireInteraction: config.requireInteraction || false,
            silent: false, // Let browser handle sound
            renotify: true,
            timestamp: Date.now(),
            vibrate: config.vibrate || [200, 100, 200]
        };

        if (this.isServiceWorkerSupported && this.swRegistration) {
            // Use service worker for background notifications
            await this.swRegistration.showNotification(config.title, notificationOptions);
        } else {
            // Fallback to regular notification
            new Notification(config.title, notificationOptions);
        }
    }

    /**
     * Show booking notification
     */
    async showBookingNotification(
        type: 'confirmed' | 'cancelled' | 'completed' | 'new_request',
        details: {
            bookingId: string;
            customerName?: string;
            therapistName?: string;
            location?: string;
            reason?: string;
        }
    ): Promise<void> {
        let title = '';
        let body = '';
        let icon = '/icons/booking.png';
        let requireInteraction = false;

        switch (type) {
            case 'confirmed':
                title = 'Booking Confirmed!';
                body = `Your booking #${details.bookingId} has been confirmed`;
                if (details.therapistName) {
                    body += ` with ${details.therapistName}`;
                }
                icon = '/icons/booking-confirmed.png';
                break;
            
            case 'cancelled':
                title = 'Booking Cancelled';
                body = `Booking #${details.bookingId} has been cancelled`;
                if (details.reason) {
                    body += `: ${details.reason}`;
                }
                icon = '/icons/booking-cancelled.png';
                break;
            
            case 'completed':
                title = 'Booking Completed';
                body = `Your massage booking #${details.bookingId} is complete. Thank you!`;
                icon = '/icons/booking-completed.png';
                break;
            
            case 'new_request':
                title = 'New Booking Request';
                body = `${details.customerName} requests massage`;
                if (details.location) {
                    body += ` at ${details.location}`;
                }
                icon = '/icons/new-booking.png';
                requireInteraction = true;
                break;
        }

        await this.showBackgroundNotification({
            title,
            body,
            icon,
            tag: `booking-${details.bookingId}`,
            soundType: type === 'cancelled' ? 'urgent' : 'booking',
            requireInteraction,
            data: {
                type: 'booking',
                action: 'view_booking',
                bookingId: details.bookingId
            }
        });
    }

    /**
     * Show chat notification
     */
    async showChatNotification(
        senderName: string,
        message: string,
        chatId: string,
        isGroup: boolean = false,
        groupName?: string
    ): Promise<void> {
        const title = isGroup ? `${groupName}: ${senderName}` : senderName;
        const body = message.length > 100 ? message.substring(0, 100) + '...' : message;
        
        await this.showBackgroundNotification({
            title,
            body,
            icon: isGroup ? '/icons/group-chat.png' : '/icons/chat.png',
            tag: `chat-${chatId}`,
            soundType: 'chat',
            data: {
                type: 'chat',
                action: 'open_chat',
                chatId,
                senderId: senderName
            }
        });
    }

    /**
     * Show coin notification
     */
    async showCoinNotification(
        amount: number,
        activity: string,
        userType: 'customer' | 'therapist' | 'hotel' | 'villa'
    ): Promise<void> {
        let title = '';
        let body = '';
        
        if (amount >= 100) {
            title = '🎉 Big Coin Reward!';
            body = `Amazing! You earned ${amount} coins for ${activity}`;
        } else if (amount >= 50) {
            title = '💰 Great Coin Reward!';
            body = `Excellent! You earned ${amount} coins for ${activity}`;
        } else {
            title = '🪙 Coins Earned!';
            body = `You earned ${amount} coins for ${activity}`;
        }

        await this.showBackgroundNotification({
            title,
            body,
            icon: '/icons/coins.png',
            tag: 'coin-notification',
            soundType: amount >= 100 ? 'achievement' : 'coin',
            data: {
                type: 'coin',
                action: 'view_coins',
                amount,
                activity,
                userType
            }
        });
    }

    /**
     * Show commission notification
     */
    async showCommissionNotification(
        type: 'request' | 'confirmed' | 'paid',
        details: {
            amount: number;
            therapistName: string;
            hotelName: string;
            commissionId: string;
        }
    ): Promise<void> {
        let title = '';
        let body = '';
        let requireInteraction = false;

        switch (type) {
            case 'request':
                title = 'Commission Request';
                body = `${details.therapistName} requests ${details.amount} coin commission confirmation`;
                requireInteraction = true;
                break;
            
            case 'confirmed':
                title = 'Commission Confirmed';
                body = `${details.hotelName} confirmed your ${details.amount} coin commission`;
                break;
            
            case 'paid':
                title = 'Commission Paid';
                body = `You received ${details.amount} coins commission payment`;
                break;
        }

        await this.showBackgroundNotification({
            title,
            body,
            icon: '/icons/commission.png',
            tag: `commission-${details.commissionId}`,
            soundType: type === 'request' ? 'booking' : 'success',
            requireInteraction,
            data: {
                type: 'commission',
                action: 'view_coins',
                commissionId: details.commissionId,
                amount: details.amount
            }
        });
    }

    /**
     * Show general notification
     */
    async showGeneralNotification(
        title: string,
        message: string,
        options?: {
            icon?: string;
            urgent?: boolean;
            action?: string;
            data?: any;
        }
    ): Promise<void> {
        await this.showBackgroundNotification({
            title,
            body: message,
            icon: options?.icon || '/icons/general.png',
            tag: 'general-notification',
            soundType: options?.urgent ? 'urgent' : 'general',
            requireInteraction: options?.urgent || false,
            data: {
                type: 'general',
                action: options?.action,
                ...options?.data
            }
        });
    }

    /**
     * Clear specific notification
     */
    async clearNotification(tag: string): Promise<void> {
        if (this.swRegistration) {
            const notifications = await this.swRegistration.getNotifications({ tag });
            notifications.forEach(notification => notification.close());
        }
    }

    /**
     * Clear all notifications
     */
    async clearAllNotifications(): Promise<void> {
        if (this.swRegistration) {
            const notifications = await this.swRegistration.getNotifications();
            notifications.forEach(notification => notification.close());
        }
    }

    /**
     * Check if service worker is supported
     */
    isSupported(): boolean {
        return this.isServiceWorkerSupported && !!this.swRegistration;
    }

    /**
     * Get notification permission status
     */
    getPermissionStatus(): NotificationPermission {
        return Notification.permission;
    }
}

// Create singleton instance
export const backgroundNotificationService = new BackgroundNotificationService();

export default backgroundNotificationService;
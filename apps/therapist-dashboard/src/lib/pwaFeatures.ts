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

// Notification Manager for PWA
export class PWANotificationManager {
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
    
    static async showChatNotification(message: {
        title: string;
        body: string;
        icon?: string;
        tag?: string;
    }): Promise<void> {
        if (!await this.requestPermission()) {
            return;
        }
        
        const notification = new Notification(message.title, {
            body: message.body,
            icon: message.icon || '/icons/therapist-icon-192.png',
            tag: message.tag || 'chat-message',
            badge: '/icons/therapist-icon-96.png',
            requireInteraction: true,
            data: {
                type: 'chat-message',
                timestamp: Date.now()
            }
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        // Handle click
        notification.onclick = () => {
            window.focus();
            notification.close();
            
            // Trigger chat open event
            window.dispatchEvent(new CustomEvent('pwa-open-chat'));
        };
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
    static init(): void {
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
            }
        });
        
        // Handle PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('pwa-install-available', {
                detail: { prompt: e }
            }));
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
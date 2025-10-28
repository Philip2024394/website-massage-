/**
 * Service Worker for Push Notifications
 * Handles notifications when app is closed, minimized, or user is on another app
 * Works on Android, iOS 16.4+, and Desktop
 */

// Service Worker version
const CACHE_VERSION = 'v1';
const CACHE_NAME = `indastreet-${CACHE_VERSION}`;

// Install event
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    // Skip waiting to activate immediately
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activated');
    // Claim all clients immediately
    event.waitUntil(self.clients.claim());
});

// Push event - receives push notifications
self.addEventListener('push', (event) => {
    console.log('📨 Service Worker: Push notification received');

    let notificationData = {
        title: '📱 IndaStreet',
        body: 'You have a new notification',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/',
            sound: '/sounds/message-notification.mp3'
        }
    };

    // Parse push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data
            };
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    }

    // Show notification
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            vibrate: notificationData.vibrate,
            tag: notificationData.data?.type || 'default',
            requireInteraction: true,
            data: notificationData.data,
            actions: [
                {
                    action: 'open',
                    title: 'Open App'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        }).then(() => {
            console.log('✅ Notification shown');
            // Play sound
            if (notificationData.data?.sound) {
                playSound(notificationData.data.sound);
            }
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Service Worker: Notification clicked');
    
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Open app or focus existing window
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window if app not open
                if (self.clients.openWindow) {
                    return self.clients.openWindow(event.notification.data?.url || '/');
                }
            })
    );
});

// Message event - receives messages from main thread
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Message received:', event.data);

    if (event.data.type === 'PLAY_SOUND') {
        playSound(event.data.soundUrl);
    }

    if (event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        self.registration.showNotification(title, options)
            .then(() => {
                console.log('✅ Notification shown from message');
                if (options.data?.sound) {
                    playSound(options.data.sound);
                }
            });
    }

    if (event.data.type === 'TEST_NOTIFICATION') {
        self.registration.showNotification('🧪 Test Notification', {
            body: 'Service Worker is working correctly!',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'test',
            data: {
                url: '/',
                sound: '/sounds/success-notification.mp3'
            }
        }).then(() => {
            playSound('/sounds/success-notification.mp3');
        });
    }
});

/**
 * Play notification sound
 * This function attempts to play audio even when app is in background
 */
async function playSound(soundUrl) {
    try {
        console.log('🔊 Service Worker: Playing sound:', soundUrl);

        // Get all clients (browser tabs/windows)
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        if (clients.length > 0) {
            // Send message to first available client to play sound
            clients[0].postMessage({
                type: 'PLAY_NOTIFICATION_SOUND',
                soundUrl: soundUrl
            });
            console.log('✅ Sound play message sent to client');
        } else {
            console.log('⚠️ No active clients to play sound');
            // On Android/iOS, the notification sound will play via system
            // On desktop with no active window, sound won't play (browser limitation)
        }
    } catch (error) {
        console.error('❌ Error playing sound:', error);
    }
}

// Background sync (optional - for offline support)
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered');
    
    if (event.tag === 'sync-notifications') {
        event.waitUntil(syncNotifications());
    }
});

async function syncNotifications() {
    try {
        console.log('🔄 Syncing notifications...');
        // Fetch pending notifications from Appwrite
        // This would require Appwrite credentials stored in service worker
        // For now, we'll rely on Realtime API in main thread
        console.log('✅ Sync complete');
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

// Fetch event - for caching assets (optional)
self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip caching for API requests
    if (event.request.url.includes('/v1/') || event.request.url.includes('appwrite')) {
        return;
    }

    // Cache strategy: Network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response for caching
                const responseClone = response.clone();
                
                // Cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request);
            })
    );
});

console.log('🚀 Service Worker: Loaded and ready');

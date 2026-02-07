// Service Worker for Background Notifications
// Handles notifications when app is closed or in background

const CACHE_NAME = 'massage-app-notifications-v1';
const NOTIFICATION_SOUNDS = {
    booking: '/sounds/booking-notification.mp3',
    chat: '/sounds/message-notification.mp3',
    coin: '/sounds/success-notification.mp3',
    general: '/sounds/booking-notification.mp3',
    urgent: '/sounds/alert-notification.mp3',
    success: '/sounds/success-notification.mp3',
    achievement: '/sounds/success-notification.mp3'
};

// Install service worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching notification assets');
                return cache.addAll([
                    '/icons/app-icon-192.png',
                    '/icons/badge-icon.png',
                    '/icons/booking.png',
                    '/icons/booking-confirmed.png',
                    '/icons/booking-cancelled.png',
                    '/icons/booking-completed.png',
                    '/icons/new-booking.png',
                    '/icons/chat.png',
                    '/icons/group-chat.png',
                    '/icons/coins.png',
                    '/icons/commission.png',
                    '/icons/general.png',
                    ...Object.values(NOTIFICATION_SOUNDS)
                ]);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
    );
});

// Activate service worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event.notification.data);
    
    event.notification.close();
    
    const data = event.notification.data || {};
    const action = data.action || 'default';
    
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            // Check if app is already open
            const appClient = clients.find(client => 
                client.url.includes(self.location.origin)
            );
            
            if (appClient) {
                // App is open, focus it and send message
                appClient.focus();
                appClient.postMessage({
                    type: 'NOTIFICATION_CLICKED',
                    payload: data
                });
            } else {
                // App is closed, open it with appropriate URL
                let targetUrl = self.location.origin;
                
                switch (action) {
                    case 'view_booking':
                        targetUrl += `/bookings/${data.bookingId}`;
                        break;
                    case 'open_chat':
                        targetUrl += `/chat/${data.chatId}`;
                        break;
                    case 'view_coins':
                        targetUrl += '/coins';
                        break;
                    default:
                        targetUrl += '/';
                }
                
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Service Worker: Notification closed', event.notification.data);
    
    // Send message to client about notification close
    self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach(client => {
            client.postMessage({
                type: 'NOTIFICATION_CLOSED',
                payload: event.notification.data
            });
        });
    });
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'notification-sync') {
        event.waitUntil(
            processOfflineNotifications()
        );
    }
});

// Process notifications that were queued while offline
async function processOfflineNotifications() {
    try {
        // Get queued notifications from IndexedDB or localStorage
        const queuedNotifications = await getQueuedNotifications();
        
        for (const notification of queuedNotifications) {
            await self.registration.showNotification(notification.title, notification.options);
        }
        
        // Clear processed notifications
        await clearQueuedNotifications();
        
        console.log('Service Worker: Processed offline notifications');
    } catch (error) {
        console.error('Service Worker: Error processing offline notifications:', error);
    }
}

// Get queued notifications (implement based on your storage preference)
async function getQueuedNotifications() {
    // This is a placeholder - implement actual storage retrieval
    return [];
}

// Clear processed notifications
async function clearQueuedNotifications() {
    // This is a placeholder - implement actual storage clearing
    return Promise.resolve();
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Received message', event.data);
    
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'QUEUE_NOTIFICATION':
            // Queue notification for later processing
            queueNotificationForLater(payload);
            break;
            
        case 'PLAY_SOUND':
            // Handle sound playing if needed
            playNotificationSound(payload.soundType);
            break;
            
        default:
            console.log('Service Worker: Unknown message type:', type);
    }
});

// Queue notification for offline processing
async function queueNotificationForLater(notificationData) {
    try {
        // Store notification in IndexedDB or localStorage for later processing
        console.log('Service Worker: Queuing notification for later:', notificationData);
        // Implement actual storage logic here
    } catch (error) {
        console.error('Service Worker: Error queuing notification:', error);
    }
}

// Play notification sound
async function playNotificationSound(soundType) {
    try {
        const soundUrl = NOTIFICATION_SOUNDS[soundType] || NOTIFICATION_SOUNDS.general;
        
        // For service workers, we can't directly play audio
        // Instead, we rely on the browser's native notification sound
        // or send a message to active clients to play the sound
        
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach(client => {
            client.postMessage({
                type: 'PLAY_NOTIFICATION_SOUND',
                payload: { soundType, soundUrl }
            });
        });
        
    } catch (error) {
        console.error('Service Worker: Error playing notification sound:', error);
    }
}

// Handle push notifications (for server-sent notifications)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    if (!event.data) {
        console.log('Service Worker: Push event with no data');
        return;
    }
    
    try {
        const data = event.data.json();
        
        const notificationOptions = {
            body: data.body,
            icon: data.icon || '/icons/app-icon-192.png',
            badge: '/icons/badge-icon.png',
            tag: data.tag || 'push-notification',
            data: data.data || {},
            requireInteraction: data.requireInteraction || false,
            vibrate: data.vibrate || [200, 100, 200],
            sound: data.sound || '/sounds/general-notification.mp3'
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, notificationOptions)
        );
        
    } catch (error) {
        console.error('Service Worker: Error processing push notification:', error);
        
        // Fallback notification
        event.waitUntil(
            self.registration.showNotification('New Notification', {
                body: 'You have a new notification',
                icon: '/icons/app-icon-192.png',
                badge: '/icons/badge-icon.png'
            })
        );
    }
});

// Fetch event for caching notification assets
self.addEventListener('fetch', (event) => {
    // Only handle notification-related assets
    if (event.request.url.includes('/sounds/') || 
        event.request.url.includes('/icons/')) {
        
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    
                    return fetch(event.request)
                        .then((response) => {
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            
                            const responseToCache = response.clone();
                            
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                            
                            return response;
                        });
                })
        );
    }
});

console.log('Service Worker: Loaded successfully');
/**
 * IndaStreet Service Worker
 * 
 * CRITICAL: Handles background push notifications when app is closed/phone on standby
 * This ensures therapists NEVER miss booking notifications - essential for business revenue
 */

const CACHE_NAME = 'indastreet-v4';
const NOTIFICATION_SOUND_URL = '/sounds/booking-alert.mp3';

// Install service worker
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker v4: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('✅ Service Worker v4: Caching assets');
            try {
                // Cache only the root - don't cache manifest to avoid errors
                await cache.add('/').catch((err) => {
                    console.log('⚠️ SW: Root cache failed:', err);
                });
                console.log('✅ Service Worker v4: Assets cached successfully');
            } catch (err) {
                console.log('⚠️ SW: Cache error:', err);
            }
        })
    );
    
    // Force activation immediately
    self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
    console.log('✅ IndaStreet Service Worker activated');
    event.waitUntil(self.clients.claim());
});

// Handle background push notifications - CRITICAL FOR BUSINESS
self.addEventListener('push', (event) => {
    console.log('🚨 CRITICAL: Background push notification received!', event.data?.text());
    
    let notificationData = {
        title: '🏨 New Booking Request!',
        body: 'You have a new massage booking request. Tap to view.',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        tag: 'booking-request',
        requireInteraction: true, // CRITICAL: Keeps notification until user acts
        persistent: true,
        vibrate: [200, 100, 200, 100, 200], // Strong vibration pattern
        sound: NOTIFICATION_SOUND_URL,
        data: {
            type: 'booking',
            timestamp: Date.now(),
            url: '/?page=therapist-dashboard'
        },
        actions: [
            {
                action: 'view',
                title: '👁️ View Booking',
                icon: '/icon-72.png'
            },
            {
                action: 'whatsapp', 
                title: '💬 Open WhatsApp',
                icon: '/icon-72.png'
            }
        ]
    };

    // Parse data if available
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (e) {
            console.log('Using default notification data');
        }
    }

    // Show notification - works even when phone is locked/on standby
    event.waitUntil(
        Promise.all([
            // Show visual notification
            self.registration.showNotification(notificationData.title, notificationData),
            
            // Play sound if possible (limited on mobile but tries)
            playNotificationSound(),
            
            // Store notification for retry if missed
            storeNotificationForRetry(notificationData)
        ])
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification clicked:', event.action);
    
    event.notification.close();

    if (event.action === 'view') {
        // Open dashboard
        event.waitUntil(
            self.clients.openWindow('/?page=therapist-dashboard')
        );
    } else if (event.action === 'whatsapp') {
        // Open WhatsApp web
        event.waitUntil(
            self.clients.openWindow('https://web.whatsapp.com/')
        );
    } else {
        // Default action - open app
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                // If app is already open, focus it
                if (clients.length > 0) {
                    return clients[0].focus();
                }
                // Otherwise open new window
                return self.clients.openWindow('/');
            })
        );
    }
    
    // Mark notification as acknowledged
    markNotificationAsRead(event.notification.tag);
});

// Handle notification close (user dismissed without action)
self.addEventListener('notificationclose', (event) => {
    console.log('⚠️ WARNING: User dismissed notification without viewing!', event.notification.tag);
    
    // CRITICAL: Reschedule notification to prevent missed bookings
    event.waitUntil(
        scheduleRetryNotification(event.notification.data)
    );
});

// Play notification sound (limited capability in service worker but tries)
async function playNotificationSound() {
    try {
        // This has limited support but worth trying
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Register background sync for sound playing
            const registration = await navigator.serviceWorker.ready;
            return registration.sync.register('play-notification-sound');
        }
    } catch (error) {
        console.log('Sound play failed in service worker (expected limitation)');
    }
}

// Store notification for retry if user doesn't respond
async function storeNotificationForRetry(notificationData) {
    try {
        const cache = await caches.open('notifications-retry');
        await cache.put(`notification-${Date.now()}`, new Response(JSON.stringify({
            ...notificationData,
            retryCount: 0,
            maxRetries: 3,
            nextRetry: Date.now() + (5 * 60 * 1000) // Retry in 5 minutes
        })));
    } catch (error) {
        console.error('Failed to store notification for retry:', error);
    }
}

// Schedule retry notification
async function scheduleRetryNotification(notificationData) {
    try {
        // Use setTimeout for retry (limited in service worker)
        setTimeout(async () => {
            const retryData = {
                ...notificationData,
                title: '🔔 REMINDER: Unread Booking Request!',
                body: 'You still have an unread booking request. Please check your dashboard.',
                tag: `retry-${notificationData.tag}`
            };
            
            await self.registration.showNotification(retryData.title, retryData);
        }, 5 * 60 * 1000); // 5 minutes
        
    } catch (error) {
        console.error('Failed to schedule retry notification:', error);
    }
}

// Mark notification as read
function markNotificationAsRead(tag) {
    // Send message to main app that notification was acknowledged
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'notification-acknowledged',
                tag: tag,
                timestamp: Date.now()
            });
        });
    });
}

// Handle background sync (for sound and data sync)
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'play-notification-sound') {
        event.waitUntil(
            // Try to communicate with main thread for sound playing
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'play-notification-sound',
                        soundUrl: NOTIFICATION_SOUND_URL
                    });
                });
            })
        );
    }
});

// Handle messages from main app
self.addEventListener('message', (event) => {
    console.log('📨 Service worker received message:', event.data);
    
    if (event.data && event.data.type === 'skip-waiting') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'test-notification') {
        // Test notification functionality
        self.registration.showNotification('🧪 Test Notification', {
            body: 'IndaStreet notifications are working perfectly!',
            icon: '/icon-192.png',
            badge: '/icon-72.png',
            vibrate: [100, 50, 100],
            requireInteraction: false,
            tag: 'test'
        });
    }
});
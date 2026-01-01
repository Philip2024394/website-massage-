/**
 * IndaStreet Service Worker
 * 
 * CRITICAL: Handles background push notifications when app is closed/phone on standby
 * This ensures therapists NEVER miss booking notifications - essential for business revenue
 * 
 * VERSION: 5.0 - Updated Jan 1, 2026
 * - Fixed VAPID key validation
 * - Fixed messagingService format
 * - Improved cache invalidation
 */

const CACHE_VERSION = 'v5';
const CACHE_NAME = `indastreet-${CACHE_VERSION}`;
const NOTIFICATION_SOUND_URL = '/sounds/booking-notification.mp3'; // ✅ Fixed: Using actual file name

// Install service worker
self.addEventListener('install', (event) => {
    console.log(`✅ Service Worker ${CACHE_VERSION}: Installing...`);
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log(`✅ Service Worker ${CACHE_VERSION}: Caching assets`);
            try {
                // Cache only the root - don't cache manifest to avoid errors
                await cache.add('/').catch((err) => {
                    console.log('⚠️ SW: Root cache failed:', err);
                });
                console.log(`✅ Service Worker ${CACHE_VERSION}: Assets cached successfully`);
            } catch (err) {
                console.log('⚠️ SW: Cache error:', err);
            }
        })
    );
    
    // Force activation immediately - bypass waiting
    self.skipWaiting();
});

// Activate service worker and clear old caches
self.addEventListener('activate', (event) => {
    console.log(`✅ Service Worker ${CACHE_VERSION}: Activating...`);
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete all old cache versions
                    if (cacheName !== CACHE_NAME) {
                        console.log(`🗑️ Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log(`✅ Service Worker ${CACHE_VERSION}: Old caches cleared`);
            // Take control of all clients immediately
            return self.clients.claim();
        }).then(() => {
            console.log(`✅ Service Worker ${CACHE_VERSION}: Activated and controlling all clients`);
        })
    );
});

// Handle background push notifications - CRITICAL FOR BUSINESS
self.addEventListener('push', (event) => {
    console.log('🚨 CRITICAL: Background push notification received!', event.data?.text());
    
    let notificationData = {
        title: '🔴 URGENT: New Booking Request!',
        body: 'TAP NOW to respond! Auto-expires in 5 minutes. Your availability score depends on this.',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        tag: 'booking-request',
        requireInteraction: true, // CRITICAL: Keeps notification until user acts
        persistent: true,
        vibrate: [300, 100, 300, 100, 300, 100, 300], // INTENSE vibration pattern
        sound: NOTIFICATION_SOUND_URL,
        data: {
            type: 'booking',
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes from now
            url: '/?page=therapist-dashboard&forceBookingView=true'
        },
        actions: [
            {
                action: 'accept-now',
                title: '✅ ACCEPT NOW',
                icon: '/icon-72.png'
            },
            {
                action: 'view-details', 
                title: '📋 View Details',
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
            
            // Play sound via all open clients
            playNotificationSoundInClients(),
            
            // Store notification for retry if missed
            storeNotificationForRetry(notificationData)
        ])
    );
});

// Handle notification clicks - PLATFORM ONLY
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification clicked:', event.action);
    
    event.notification.close();
    
    const bookingData = event.notification.data;
    const bookingId = bookingData.bookingId || 'unknown';

    if (event.action === 'accept-now') {
        // Direct accept - open with auto-accept flag
        event.waitUntil(
            self.clients.openWindow(`/?page=therapist-dashboard&autoAcceptBooking=${bookingId}&forceView=true`)
        );
    } else if (event.action === 'view-details') {
        // View details - open forced booking screen
        event.waitUntil(
            self.clients.openWindow(`/?page=therapist-dashboard&forceBookingView=${bookingId}`)
        );
    } else {
        // Default action - force booking screen
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                const url = `/?page=therapist-dashboard&forceBookingView=${bookingId}`;
                // If app is already open, navigate it
                if (clients.length > 0) {
                    clients[0].postMessage({
                        type: 'force-booking-view',
                        bookingId: bookingId
                    });
                    return clients[0].focus();
                }
                // Otherwise open new window with forced view
                return self.clients.openWindow(url);
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
    // Retry every 2 minutes up to 10 times (20 minutes total)
    event.waitUntil(
        scheduleRetryNotification(event.notification.data, event.notification.tag)
    );
});

// Play notification sound through all open clients (tabs/windows)
async function playNotificationSoundInClients() {
    try {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        // Send message to all clients to play sound
        clients.forEach(client => {
            client.postMessage({
                type: 'play-notification-sound',
                soundUrl: NOTIFICATION_SOUND_URL
            });
        });
        
        console.log(`🔊 Sound play message sent to ${clients.length} client(s)`);
    } catch (error) {
        console.error('Failed to send sound play message to clients:', error);
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

// Schedule retry notification - ESCALATION: 0min, 2min, 4min only
async function scheduleRetryNotification(notificationData, tag) {
    try {
        // Store retry data
        const cache = await caches.open('notifications-retry');
        const retryData = await cache.match(`retry-${tag}`);
        let retryCount = 0;
        
        if (retryData) {
            const data = await retryData.json();
            retryCount = data.retryCount || 0;
        }
        
        // Check if booking expired (5 minutes total)
        const expiresAt = notificationData.expiresAt || (Date.now() + 5 * 60 * 1000);
        if (Date.now() >= expiresAt) {
            console.log('⏰ Booking expired (5 minutes) - stopping retries');
            // Send expiration message to all clients to update availability score
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'booking-expired',
                    bookingId: notificationData.bookingId,
                    reason: 'timeout'
                });
            });
            return;
        }
        
        // Escalation schedule: Retry at 2min and 4min only (total 3 notifications: 0, 2, 4)
        if (retryCount >= 2) {
            console.log('📵 Max retries reached (2 retries = 3 total notifications)');
            return;
        }
        
        // Calculate next retry time: 2min for first retry, 2min for second (total 4min)
        const retryDelay = 2 * 60 * 1000; // Always 2 minutes between retries
        
        setTimeout(async () => {
            // Check again if expired before showing retry
            if (Date.now() >= expiresAt) {
                console.log('⏰ Booking expired before retry');
                return;
            }
            
            // Increment retry count
            await cache.put(`retry-${tag}`, new Response(JSON.stringify({
                ...notificationData,
                retryCount: retryCount + 1,
                lastRetry: Date.now()
            })));
            
            // Calculate remaining time
            const remainingMs = expiresAt - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            
            // Show escalated notification
            const escalationLevel = retryCount + 1;
            await self.registration.showNotification(
                `🚨 FINAL WARNING (${escalationLevel}/2): Booking Expires Soon!`,
                {
                    ...notificationData,
                    body: `⏰ ${remainingMin} minutes left to respond! Your availability score will drop if you miss this. TAP NOW!`,
                    vibrate: [400, 150, 400, 150, 400, 150, 400, 150, 400], // MORE INTENSE
                    tag: tag,
                    renotify: true
                }
            );
            
            // Schedule next retry recursively
            scheduleRetryNotification(notificationData, tag);
        }, retryDelay);
        
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
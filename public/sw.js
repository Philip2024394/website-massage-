/**
 * SERVICE WORKER - PUSH NOTIFICATIONS
 * Handles push events and displays notifications even when app is closed
 * 
 * Purpose: Enable real-time booking + chat notifications
 * Architecture: Web Push API + VAPID
 * Integrates with: systemNotificationMapper.ts, Appwrite booking statuses
 * 
 * CRITICAL: This file runs in service worker context (no DOM access)
 * VERSION: 6.0 - Updated Jan 6, 2026
 * - Integrated with systemNotificationMapper
 * - Standardized booking status notifications
 * - Added click routing to chat/booking pages
 * - PWA-ready for future enhancements
 */

const SW_VERSION = '6.0.0';
const CACHE_NAME = `push-notifications-v6`;
const NOTIFICATION_SOUND_URL = '/sounds/booking-notification.mp3';

// Install service worker
self.addEventListener('install', (event) => {
    console.log(`✅ Service Worker ${SW_VERSION} installing...`);
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log(`✅ Service Worker ${SW_VERSION}: Caching assets`);
            try {
                await cache.add('/').catch((err) => {
                    console.log('⚠️ SW: Root cache failed:', err);
                });
                // Cache essential assets for offline functionality
                await cache.addAll([
                    '/',
                    '/index.html',
                    '/manifest.json'
                ]).catch((err) => {
                    console.log('⚠️ SW: Asset caching failed:', err);
                });
                });
                console.log(`✅ Service Worker ${SW_VERSION}: Assets cached successfully`);
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
    console.log(`✅ Service Worker ${SW_VERSION}: Activating...`);
    
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
            console.log(`✅ Service Worker ${SW_VERSION}: Old caches cleared`);
            // Take control of all clients immediately
            return self.clients.claim();
        }).then(() => {
            console.log(`✅ Service Worker ${SW_VERSION}: Activated and controlling all clients`);
        })
    );
});

/**
 * FETCH EVENT HANDLER
 * Ensures preview always displays fresh content and never shows offline messages
 * Strategy: Network first, then cache, with automatic retry
 */
self.addEventListener('fetch', (event) => {
    // Only handle navigation requests (page loads)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // If we get a fresh response, return it immediately
                    if (response.ok) {
                        console.log('✅ SW: Serving fresh content');
                        return response;
                    }
                    throw new Error('Server not available');
                })
                .catch(() => {
                    // If network fails, try to return cached version
                    console.log('⚠️ SW: Network unavailable, checking cache...');
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('✅ SW: Serving cached content');
                            return cachedResponse;
                        }
                        // If no cache, return a custom "server starting" page instead of offline message
                        return new Response(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Server Starting...</title>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <style>
                                    body { 
                                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                        display: flex; align-items: center; justify-content: center;
                                        height: 100vh; margin: 0; background: #f5f5f5;
                                        text-align: center;
                                    }
                                    .container { max-width: 400px; padding: 2rem; }
                                    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #007bff;
                                               border-radius: 50%; width: 40px; height: 40px;
                                               animation: spin 1s linear infinite; margin: 0 auto 1rem; }
                                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                    h1 { color: #333; margin-bottom: 1rem; }
                                    p { color: #666; line-height: 1.5; }
                                </style>
                                <script>
                                    // Auto-retry loading the page every 5 seconds
                                    setTimeout(() => { window.location.reload(); }, 5000);
                                </script>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="spinner"></div>
                                    <h1>🚀 Server Starting...</h1>
                                    <p>Your massage booking platform is loading.<br>
                                       This page will refresh automatically in 5 seconds.</p>
                                    <p><small>If this continues, the development server may need to be restarted.</small></p>
                                </div>
                            </body>
                            </html>
                        `, {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    });
                })
        );
    }
});

/**
 * PUSH EVENT HANDLER
 * Receives push notifications from server and displays them
 * Integrates with systemNotificationMapper.ts for consistent messaging
 */
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');

    if (!event.data) {
        console.warn('⚠️ Push event has no data');
        return;
    }

    try {
        const data = event.data.json();
        console.log('📦 Push data:', data);

        // Extract notification details from systemNotificationMapper format
        const {
            title = 'New Notification',
            body = 'You have a new notification',
            icon = '/icon-192.png',
            badge = '/badge-72.png',
            bookingId = '',
            status = '',
            priority = 'normal',
            targetUrl = '/',
            role = 'customer'
        } = data;

        // Vibration patterns based on priority (from systemNotificationMapper)
        const vibrationPatterns = {
            low: [100],
            normal: [200],
            high: [200, 100, 200],
            critical: [300, 100, 300, 100, 300]
        };

        // Notification options
        const options = {
            body,
            icon,
            badge,
            vibrate: vibrationPatterns[priority] || vibrationPatterns.normal,
            tag: bookingId ? `booking-${bookingId}` : `notification-${Date.now()}`,
            requireInteraction: priority === 'critical',
            data: {
                bookingId,
                status,
                role,
                targetUrl: targetUrl || (bookingId ? `/chat?bookingId=${bookingId}` : '/'),
                timestamp: Date.now()
            },
            actions: bookingId ? [
                {
                    action: 'open-chat',
                    title: 'Open Chat',
                    icon: '/icons/chat.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: '/icons/close.png'
                }
            ] : []
        };

        // Show notification - works even when app closed
        event.waitUntil(
            Promise.all([
                self.registration.showNotification(title, options),
                playNotificationSoundInClients()
            ])
        );

        console.log(`✅ Push notification displayed: ${title}`);
    } catch (error) {
        console.error('❌ Push event handler error:', error);
    }
});

/**
 * NOTIFICATION CLICK HANDLER
 * Routes user to correct page based on notification type
 */
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notification clicked:', event.action);

    const notification = event.notification;
    const action = event.action;
    const data = notification.data || {};

    // Close notification
    notification.close();

    // Handle action
    if (action === 'dismiss') {
        console.log('❌ Notification dismissed by user');
        return;
    }

    // Determine target URL based on role and booking ID
    let targetUrl = data.targetUrl || '/';
    
    if (action === 'open-chat' && data.bookingId) {
        targetUrl = `/chat?bookingId=${data.bookingId}`;
    } else if (data.bookingId && data.role === 'therapist') {
        targetUrl = `/?page=therapist-dashboard&bookingId=${data.bookingId}`;
    } else if (data.bookingId && data.role === 'admin') {
        targetUrl = `/admin/chat-monitor?bookingId=${data.bookingId}`;
    } else if (data.bookingId) {
        targetUrl = `/chat?bookingId=${data.bookingId}`;
    }

    console.log(`🔗 Opening URL: ${targetUrl}`);

    // Open or focus window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if window is already open
                for (const client of clientList) {
                    try {
                        const clientUrl = new URL(client.url);
                        const targetUrlObj = new URL(targetUrl, client.url);

                        // If same origin, focus and navigate
                        if (clientUrl.origin === targetUrlObj.origin) {
                            if (client.focus) {
                                client.focus();
                            }
                            if (client.navigate) {
                                return client.navigate(targetUrl);
                            }
                            return client;
                        }
                    } catch (urlError) {
                        console.warn('URL parsing error:', urlError);
                    }
                }

                // No window open, open new one
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
            .catch((error) => {
                console.error('❌ Failed to handle notification click:', error);
            })
    );
});

/**
 * NOTIFICATION CLOSE HANDLER
 * Track when user closes notification without clicking
 */
self.addEventListener('notificationclose', (event) => {
    console.log('🚫 Notification closed by user');
    
    const notification = event.notification;
    const data = notification.data || {};

    // Optional: Send analytics or tracking event
    console.log(`📊 Notification closed: ${data.bookingId || 'unknown'}`);
});

/**
 * Play notification sound through all open clients (tabs/windows)
 */
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

/**
 * MESSAGE HANDLER
 * Handles messages from main app (e.g., sync requests, test notifications)
 */
self.addEventListener('message', (event) => {
    console.log('📨 Message received from client:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'skip-waiting') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: SW_VERSION });
    }

    if (event.data && event.data.type === 'test-notification') {
        // Test notification functionality
        self.registration.showNotification('🧪 Test Notification', {
            body: 'Push notifications are working perfectly!',
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            vibrate: [100, 50, 100],
            requireInteraction: false,
            tag: 'test'
        });
    }
});

/**
 * FETCH HANDLER (Optional)
 * Pass through all requests (no caching for now)
 * Can implement caching strategy here if needed for PWA offline support
 */
self.addEventListener('fetch', (event) => {
    // Pass through all requests - no caching currently
    event.respondWith(fetch(event.request).catch(() => {
        // Could return cached fallback here for offline support
        return new Response('Offline');
    }));
});

/**
 * SYNC HANDLER (Optional - Future Enhancement)
 * Can be used for background sync when connection is restored
 */
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync event:', event.tag);

    if (event.tag === 'sync-notifications') {
        event.waitUntil(
            // Could sync missed notifications from Appwrite here
            Promise.resolve()
        );
    }

    if (event.tag === 'play-notification-sound') {
        event.waitUntil(
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

/**
 * PUSH SUBSCRIPTION CHANGE HANDLER
 * Handles when push subscription changes or expires
 */
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('🔄 Push subscription changed');

    event.waitUntil(
        // Re-subscribe with new subscription
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: null // Should use stored VAPID key
        })
        .then((subscription) => {
            console.log('✅ Re-subscribed with new subscription');
            
            // TODO: Update subscription in Appwrite
            // Send to backend endpoint to update push_subscriptions collection
            
            return subscription;
        })
        .catch((error) => {
            console.error('❌ Re-subscription failed:', error);
        })
    );
});

// Log service worker readiness
console.log(`🚀 Service Worker ${SW_VERSION} loaded and ready for push notifications`);
console.log('✅ Integrated with systemNotificationMapper for consistent messaging');
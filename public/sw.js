/**
 * SERVICE WORKER - PUSH NOTIFICATIONS
 * Handles push events and displays notifications even when app is closed
 * 
 * Purpose: Enable real-time booking + chat notifications
 * Architecture: Web Push API + VAPID
 * Integrates with: systemNotificationMapper.ts, Appwrite booking statuses
 * 
 * CRITICAL: This file runs in service worker context (no DOM access)
 * VERSION: 2.2.0 - Updated Jan 10, 2026
 * - Synced with main service-worker.js version
 * - Integrated with systemNotificationMapper
 * - Standardized booking status notifications
 * - Added click routing to chat/booking pages
 * - PWA-ready for future enhancements
 */

const SW_VERSION = '2.2.5';
const CACHE_NAME = `push-notifications-v2-5`;
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
            // 🔥 AGGRESSIVE CACHE CLEARING - Delete ALL caches to prevent redirect loops
            console.log(`🗑️ Deleting ALL caches (${cacheNames.length} found) to prevent PWA redirect issues`);
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log(`🗑️ Deleting cache: ${cacheName}`);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log(`✅ Service Worker ${SW_VERSION}: All caches cleared - fresh start`);
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
 * CRITICAL: Appwrite storage images are NEVER cached or intercepted
 */
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // ✅ BYPASS: Appwrite storage images (NEVER cache or intercept)
    if (
        url.includes('/v1/storage/') ||
        url.includes('syd.cloud.appwrite.io/v1/storage/') ||
        event.request.destination === 'image'
    ) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // In local development, do not intercept fetch; let network handle it
    try {
        const host = new URL(event.request.url).hostname;
        if (['localhost', '127.0.0.1'].includes(host)) {
            // DEVELOPMENT MODE: Always fetch fresh content, never cache
            console.log('🔧 DEV MODE: Bypassing cache for', event.request.url);
            return; // allow default browser handling
        }
    } catch {}
    
    // PRODUCTION MODE: Network-first strategy with cache fallback
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
                        // Network and cache both failed - return simple offline message
                        return new Response(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Connection Required</title>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <style>
                                    body { 
                                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                        display: flex; align-items: center; justify-content: center;
                                        height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        text-align: center; color: white;
                                    }
                                    .container { max-width: 400px; padding: 2rem; }
                                    h1 { margin-bottom: 1rem; font-size: 2rem; }
                                    p { line-height: 1.6; opacity: 0.9; margin-bottom: 1.5rem; }
                                    button { 
                                        background: white; color: #667eea; border: none; 
                                        padding: 12px 24px; border-radius: 8px; font-size: 16px;
                                        font-weight: 600; cursor: pointer; transition: transform 0.2s;
                                    }
                                    button:hover { transform: scale(1.05); }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h1>📡 Connection Required</h1>
                                    <p>Please check your internet connection and try again.</p>
                                    <button onclick="window.location.reload()">Retry</button>
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

        // ULTIMATE VIBRATION PATTERNS - Maximum strength for standby mode
        const vibrationPatterns = {
            low: [200, 100, 200],
            normal: [400, 200, 400, 200, 400],
            high: [500, 100, 500, 100, 500, 100, 500],
            critical: [1000, 200, 1000, 200, 1000, 200, 1000] // Maximum 7 second pattern
        };

        // ULTIMATE NOTIFICATION OPTIONS - Maximum visibility and persistence
        const options = {
            body,
            icon,
            badge,
            // Maximum vibration for all notifications
            vibrate: vibrationPatterns[priority] || vibrationPatterns.high,
            
            // Unique tag to prevent grouping, allows multiple notifications
            tag: bookingId ? `booking-${bookingId}-${Date.now()}` : `notification-${Date.now()}`,
            
            // Require user interaction for ALL notifications (they must tap to dismiss)
            requireInteraction: true,
            
            // Sticky notification - stays until dismissed
            sticky: true,
            
            // Renotify - vibrate again even if notification exists
            renotify: true,
            
            // Silent - we control sound (prevents duplicate system sounds)
            silent: false, // Let system play default sound in standby
            
            // Timestamp for sorting
            timestamp: Date.now(),
            
            // Direction and language
            dir: 'auto',
            lang: 'id-ID',
            
            // Image for rich notifications
            image: icon,
            
            data: {
                bookingId,
                status,
                role,
                targetUrl: targetUrl || (bookingId ? `/chat?bookingId=${bookingId}` : '/'),
                timestamp: Date.now(),
                priority,
                urgent: true
            },
            
            // Prominent action buttons
            actions: bookingId ? [
                {
                    action: 'open-chat',
                    title: '💬 BUKA CHAT SEKARANG',
                    icon: '/icons/chat.png'
                },
                {
                    action: 'view-booking',
                    title: '📋 LIHAT BOOKING',
                    icon: '/icons/booking.png'
                }
            ] : [
                {
                    action: 'open',
                    title: '🔔 BUKA APLIKASI',
                    icon: '/icon-192.png'
                }
            ]
        };

        // Show notification + update badge counter - works even when app closed
        event.waitUntil(
            Promise.all([
                self.registration.showNotification(title, options),
                playNotificationSoundInClients(),
                updateNotificationBadge()
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

    // Close notification and update badge
    notification.close();
    
    // Clear badge if no more notifications
    event.waitUntil(
        updateNotificationBadge()
    );

    // Handle action
    if (action === 'dismiss') {
        console.log('❌ Notification dismissed by user');
        return;
    }

    // Determine target URL based on role and booking ID
    let targetUrl = data.targetUrl || '/';
    
    if (action === 'open-chat' && data.bookingId) {
        targetUrl = `/chat?bookingId=${data.bookingId}`;
    } else if (action === 'view-booking' && data.bookingId) {
        // Direct to booking management page
        if (data.role === 'therapist') {
            targetUrl = `/?page=therapist-bookings&bookingId=${data.bookingId}`;
        } else if (data.role === 'admin') {
            targetUrl = `/admin/bookings?bookingId=${data.bookingId}`;
        } else {
            targetUrl = `/bookings?id=${data.bookingId}`;
        }
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
 * Update notification badge counter
 * Shows unread count on app icon
 */
async function updateNotificationBadge() {
    try {
        // Get all current notifications
        const notifications = await self.registration.getNotifications();
        const unreadCount = notifications.length;
        
        // Update badge (supported on Android, some iOS versions)
        if ('setAppBadge' in navigator) {
            await navigator.setAppBadge(unreadCount);
        } else if ('setClientBadge' in self) {
            await self.setClientBadge(unreadCount);
        }
        
        console.log(`📛 Badge updated: ${unreadCount} unread notifications`);
    } catch (error) {
        console.log('Badge update not supported:', error.message);
    }
}

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
    
    // Handle badge clear request
    if (event.data && event.data.type === 'CLEAR_BADGE') {
        updateNotificationBadge();
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
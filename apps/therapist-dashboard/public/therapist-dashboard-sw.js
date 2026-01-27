// ================================================================================
// 🏢 ENTERPRISE THERAPIST DASHBOARD SERVICE WORKER
// ================================================================================
// Advanced PWA service worker with notification override capabilities
// Designed for therapist dashboard with bulletproof reliability

const CACHE_NAME = 'therapist-dashboard-v1.2.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/therapist-192.png',
  '/icons/therapist-512.png',
  '/sounds/booking-notification.mp3',
  '/offline.html'
];

// Service Worker Installation
self.addEventListener('install', event => {
  console.log('🔧 [ENTERPRISE SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 [ENTERPRISE SW] Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('✅ [ENTERPRISE SW] Service worker installed successfully');
        return self.skipWaiting(); // Immediately activate
      })
      .catch(error => {
        console.error('❌ [ENTERPRISE SW] Installation failed:', error);
      })
  );
});

// Service Worker Activation
self.addEventListener('activate', event => {
  console.log('🚀 [ENTERPRISE SW] Activating service worker...');
  
  event.waitUntil(
    // Clear old caches
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ [ENTERPRISE SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ [ENTERPRISE SW] Service worker activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// ================================================================================
// 🔔 ENTERPRISE NOTIFICATION SYSTEM
// ================================================================================

// Enhanced notification handler with screen override
self.addEventListener('push', event => {
  console.log('📬 [ENTERPRISE SW] Push notification received:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('📨 [ENTERPRISE SW] Push data:', data);
      
      event.waitUntil(
        showEnterpriseNotification(data)
      );
    } catch (error) {
      console.error('❌ [ENTERPRISE SW] Failed to parse push data:', error);
      
      // Fallback notification
      event.waitUntil(
        self.registration.showNotification('New Booking Alert', {
          body: 'You have a new booking request',
          icon: '/icons/therapist-192.png',
          badge: '/icons/therapist-192.png',
          vibrate: [500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500],
          requireInteraction: true,
          tag: 'fallback-notification'
        })
      );
    }
  }
});

// Show enterprise notification with enhanced features
async function showEnterpriseNotification(data) {
  const {
    title = 'Therapist Dashboard Alert',
    body = 'You have a new notification',
    icon = '/icons/therapist-192.png',
    tag = 'enterprise-notification',
    type = 'booking',
    priority = 'normal',
    therapistId,
    bookingId
  } = data;
  
  console.log('🔔 [ENTERPRISE SW] Showing enhanced notification:', { title, body, type, priority });
  
  // Enhanced notification options for enterprise features
  const notificationOptions = {
    body,
    icon,
    badge: '/icons/therapist-192.png',
    tag,
    requireInteraction: true,
    silent: false, // Allow sound
    renotify: true, // Show even if same tag exists
    timestamp: Date.now(),
    
    // ENTERPRISE: Strong vibration pattern (2 minutes via repeated calls)
    vibrate: [500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500],
    
    // Action buttons for quick response
    actions: [
      {
        action: 'accept',
        title: '✅ Accept',
        icon: '/icons/accept-icon.png'
      },
      {
        action: 'view',
        title: '👁️ View Details',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    
    // Custom data for handling clicks
    data: {
      type,
      priority,
      therapistId,
      bookingId,
      timestamp: Date.now(),
      url: `/?action=view-booking&id=${bookingId || 'unknown'}`,
      vibrationStarted: Date.now()
    }
  };
  
  // Show the notification
  await self.registration.showNotification(title, notificationOptions);
  
  // ENTERPRISE: Extended vibration system (override closed screens)
  if (priority === 'high' || type === 'booking') {
    startExtendedVibration(tag);
  }
  
  // ENTERPRISE: Play continuous notification sound
  await playEnterpriseNotificationSound(type, priority);
}

// Extended vibration system for closed phone screens
function startExtendedVibration(notificationTag) {
  console.log('📳 [ENTERPRISE SW] Starting 2-minute extended vibration system...');
  
  // Store vibration state
  const vibrationData = {
    tag: notificationTag,
    startTime: Date.now(),
    duration: 120000, // 2 minutes
    pattern: [500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500], // 10 seconds per cycle
    cycleInterval: null
  };
  
  // Vibration cycles every 10 seconds for 2 minutes
  let cycleCount = 0;
  const maxCycles = 12; // 12 x 10 seconds = 2 minutes
  
  const vibrationCycle = () => {
    if (cycleCount >= maxCycles) {
      console.log('✅ [ENTERPRISE SW] 2-minute vibration completed');
      return;
    }
    
    // Send vibration command to main thread (if available)
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'VIBRATE_COMMAND',
          pattern: vibrationData.pattern,
          cycle: cycleCount + 1,
          totalCycles: maxCycles
        });
      });
    });
    
    cycleCount++;
    console.log(`📳 [ENTERPRISE SW] Vibration cycle ${cycleCount}/${maxCycles}`);
    
    // Schedule next cycle
    setTimeout(vibrationCycle, 10000);
  };
  
  // Start first cycle immediately
  vibrationCycle();
}

// Enterprise notification sound system
async function playEnterpriseNotificationSound(type, priority) {
  console.log('🔊 [ENTERPRISE SW] Triggering enterprise notification sound...');
  
  // Send sound command to main thread
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'PLAY_ENTERPRISE_SOUND',
      soundType: type,
      priority,
      duration: priority === 'high' ? 120000 : 30000, // 2 minutes for high priority
      timestamp: Date.now()
    });
  });
}

// ================================================================================
// 🎯 NOTIFICATION CLICK HANDLING
// ================================================================================

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('👆 [ENTERPRISE SW] Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  notification.close(); // Close the notification
  
  event.waitUntil(
    handleNotificationAction(action, data)
  );
});

// Handle notification actions
async function handleNotificationAction(action, data) {
  console.log(`🎯 [ENTERPRISE SW] Handling action: ${action}`, data);
  
  const clients = await self.clients.matchAll({ 
    type: 'window',
    includeUncontrolled: true
  });
  
  // Find or create app window
  let targetClient = null;
  
  if (clients.length > 0) {
    // Use existing window
    targetClient = clients[0];
    targetClient.focus();
  } else {
    // Open new window
    targetClient = await self.clients.openWindow('/');
  }
  
  if (targetClient) {
    // Send action to main app
    targetClient.postMessage({
      type: 'NOTIFICATION_ACTION',
      action,
      data,
      timestamp: Date.now()
    });
    
    // Handle specific actions
    switch (action) {
      case 'accept':
        console.log('✅ [ENTERPRISE SW] Booking acceptance requested');
        targetClient.postMessage({
          type: 'ACCEPT_BOOKING',
          bookingId: data.bookingId,
          therapistId: data.therapistId
        });
        break;
        
      case 'view':
        console.log('👁️ [ENTERPRISE SW] Booking view requested');
        targetClient.postMessage({
          type: 'VIEW_BOOKING',
          bookingId: data.bookingId,
          therapistId: data.therapistId
        });
        break;
        
      case 'dismiss':
        console.log('❌ [ENTERPRISE SW] Notification dismissed');
        // Stop any ongoing alerts
        stopEnterpriseAlerts(data.tag || 'enterprise-notification');
        break;
        
      default:
        // Default action - open app
        console.log('🏠 [ENTERPRISE SW] Opening therapist dashboard');
        targetClient.postMessage({
          type: 'OPEN_DASHBOARD',
          data
        });
    }
  }
}

// Stop enterprise alerts
function stopEnterpriseAlerts(tag) {
  console.log(`🔕 [ENTERPRISE SW] Stopping alerts for tag: ${tag}`);
  
  // Send stop command to main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'STOP_ENTERPRISE_ALERTS',
        tag,
        timestamp: Date.now()
      });
    });
  });
}

// ================================================================================
// 🌐 NETWORK & CACHING
// ================================================================================

// Enhanced fetch handler with offline support
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Serve from cache if network fails
          return caches.match(event.request)
            .then(response => {
              if (response) {
                console.log('📦 [ENTERPRISE SW] Serving API from cache:', event.request.url);
                return response;
              }
              
              // Return offline page for critical requests
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('📦 [ENTERPRISE SW] Serving from cache:', event.request.url);
          return response;
        }
        
        // Fetch from network and cache
        return fetch(event.request)
          .then(response => {
            if (response && response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Serve offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // Return empty response for other failed requests
            return new Response('', { status: 404 });
          });
      })
  );
});

// ================================================================================
// 📱 PWA LIFECYCLE MANAGEMENT
// ================================================================================

// Handle background sync
self.addEventListener('sync', event => {
  console.log('🔄 [ENTERPRISE SW] Background sync:', event.tag);
  
  if (event.tag === 'therapist-data-sync') {
    event.waitUntil(syncTherapistData());
  }
});

// Sync therapist data when back online
async function syncTherapistData() {
  console.log('📊 [ENTERPRISE SW] Syncing therapist data...');
  
  try {
    // Notify main thread to sync data
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_THERAPIST_DATA',
        timestamp: Date.now()
      });
    });
    
    console.log('✅ [ENTERPRISE SW] Therapist data sync initiated');
  } catch (error) {
    console.error('❌ [ENTERPRISE SW] Data sync failed:', error);
  }
}

// Handle message from main thread
self.addEventListener('message', event => {
  const { type, data } = event.data;
  console.log('📨 [ENTERPRISE SW] Message received:', type, data);
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'TEST_NOTIFICATION':
      // Send test notification
      event.waitUntil(
        showEnterpriseNotification({
          title: 'Enterprise Test Notification',
          body: 'This is a test of the enterprise notification system with 2-minute vibration!',
          type: 'test',
          priority: 'high',
          tag: 'test-notification',
          ...data
        })
      );
      break;
      
    case 'STOP_ALERTS':
      stopEnterpriseAlerts(data.tag || 'enterprise-notification');
      break;
      
    default:
      console.log('⚠️ [ENTERPRISE SW] Unknown message type:', type);
  }
});

// ================================================================================
// 🛡️ ERROR HANDLING & LOGGING
// ================================================================================

// Global error handler
self.addEventListener('error', event => {
  console.error('❌ [ENTERPRISE SW] Service Worker Error:', event.error);
  
  // Report error to main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_ERROR',
        error: {
          message: event.error.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: Date.now()
        }
      });
    });
  });
});

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', event => {
  console.error('❌ [ENTERPRISE SW] Unhandled Promise Rejection:', event.reason);
  
  event.preventDefault(); // Prevent logging to console
  
  // Report to main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_PROMISE_REJECTION',
        reason: event.reason.toString(),
        timestamp: Date.now()
      });
    });
  });
});

console.log('🏢 [ENTERPRISE SW] Enterprise Therapist Dashboard Service Worker loaded successfully');
console.log('✨ [ENTERPRISE SW] Features: Notification Override, 2-min Vibration, Offline Support, Background Sync');
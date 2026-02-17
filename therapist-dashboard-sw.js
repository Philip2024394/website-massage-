/**
 * 🏢 ENTERPRISE THERAPIST DASHBOARD SERVICE WORKER
 * Handles notifications with screen override and vibration
 * Ensures therapists never miss bookings even when phone is locked
 */

const CACHE_NAME = 'therapist-dashboard-v1';
const THERAPIST_DASHBOARD_URL = '/#/dashboard/therapist';

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 [THERAPIST SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        THERAPIST_DASHBOARD_URL,
        '/icons/therapist-192.png',
        '/icons/therapist-512.png',
        '/sounds/booking-notification.mp3'
      ]);
    })
  );
  
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ [THERAPIST SW] Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Enhanced notification handling with screen override
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [THERAPIST SW] Notification clicked');
  
  event.notification.close();
  
  // Handle different notification actions
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  event.waitUntil(
    handleNotificationClick(action, notificationData)
  );
});

// Enhanced notification click handler
async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // Always navigate to therapist dashboard
  const dashboardUrl = new URL(THERAPIST_DASHBOARD_URL, self.location.origin).href;
  
  // Check if therapist dashboard is already open
  for (const client of clients) {
    if (client.url.includes('dashboard/therapist')) {
      console.log('✅ [THERAPIST SW] Focusing existing dashboard');
      return client.focus();
    }
  }

  // Open new therapist dashboard window
  console.log('🚀 [THERAPIST SW] Opening therapist dashboard');
  return self.clients.openWindow(dashboardUrl);
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('🔄 [THERAPIST SW] Background sync:', event.tag);
  
  if (event.tag === 'therapist-data-sync') {
    event.waitUntil(syncTherapistData());
  }
});

// Sync therapist data when back online
async function syncTherapistData() {
  try {
    // Sync pending save operations
    const pendingSaves = await getFromIndexedDB('pending-saves');
    if (pendingSaves && pendingSaves.length > 0) {
      console.log('📤 [THERAPIST SW] Syncing pending saves:', pendingSaves.length);
      
      for (const save of pendingSaves) {
        try {
          await syncSaveOperation(save);
          await removeFromIndexedDB('pending-saves', save.id);
        } catch (error) {
          console.error('❌ [THERAPIST SW] Save sync failed:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ [THERAPIST SW] Data sync failed:', error);
  }
}

// Enhanced push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 [THERAPIST SW] Push notification received');
  
  if (!event.data) {
    console.warn('⚠️ [THERAPIST SW] Push event but no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('❌ [THERAPIST SW] Failed to parse push data:', error);
    return;
  }

  const options = {
    title: data.title || 'New Booking Request!',
    body: data.body || 'You have a new booking request',
    icon: '/icons/therapist-192.png',
    badge: '/icons/therapist-badge-72.png',
    vibrate: [500, 200, 500, 200, 500, 200, 500], // Strong vibration
    requireInteraction: true,
    persistent: true,
    tag: 'therapist-booking',
    data: {
      type: 'booking',
      bookingId: data.bookingId,
      timestamp: Date.now(),
      ...data
    },
    actions: [
      {
        action: 'accept',
        title: '✅ Accept Booking',
        icon: '/icons/accept-action.png'
      },
      {
        action: 'view',
        title: '👁️ View Details',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );

  // Enhanced vibration and sound for critical booking notifications
  if (data.type === 'booking' || data.priority === 'high') {
    event.waitUntil(playNotificationSound());
  }
});

// Play notification sound (works even when screen is off)
async function playNotificationSound() {
  try {
    // Try to get clients and play sound
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
      client.postMessage({
        type: 'play-notification-sound',
        soundUrl: '/sounds/booking-notification.mp3',
        volume: 1.0,
        loop: true
      });
    }
  } catch (error) {
    console.error('❌ [THERAPIST SW] Sound playback failed:', error);
  }
}

// Fetch event with caching strategy
self.addEventListener('fetch', (event) => {
  // Cache-first strategy for static assets
  if (event.request.destination === 'image' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Network-first strategy for API calls
  if (event.request.url.includes('/api/') || event.request.url.includes('appwrite')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Default handling
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Utility functions for IndexedDB
async function getFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TherapistDashboard', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function removeFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TherapistDashboard', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function syncSaveOperation(saveOperation) {
  // Implementation for syncing save operations
  const response = await fetch('/api/sync-therapist-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(saveOperation)
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.statusText}`);
  }
  
  return response.json();
}
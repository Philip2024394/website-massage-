// Service Worker for IndaStreet Admin Dashboard PWA
const CACHE_NAME = 'indastreet-admin-v1';
const NOTIFICATION_SOUND_URL = 'https://ik.imagekit.io/7grri5v7d/notification-sound.mp3';

self.addEventListener('install', (event) => {
  console.log('Admin Dashboard SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.tsx',
        '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Admin Dashboard SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Admin Dashboard SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();
        
        // Cache the fetched response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // If fetch fails, try to return from cache
        return caches.match(event.request);
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Admin Dashboard SW: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  
  // Play notification sound
  playNotificationSound();
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/admin-icon-192.png',
    badge: '/icons/admin-icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'Open Dashboard', icon: '/icons/admin-icon-96.png' },
      { action: 'close', title: 'Dismiss' }
    ],
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'IndaStreet Admin', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Admin Dashboard SW: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Function to play notification sound
function playNotificationSound() {
  try {
    // Create audio context
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5; // 50% volume
    audio.play().catch((err) => {
      console.log('Admin Dashboard SW: Could not play notification sound:', err);
    });
  } catch (error) {
    console.log('Admin Dashboard SW: Audio playback error:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Admin Dashboard SW: Background sync triggered');
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Sync any pending data when connection is restored
      syncPendingData()
    );
  }
});

async function syncPendingData() {
  console.log('Admin Dashboard SW: Syncing pending data...');
  // Implementation for syncing offline changes
  // This will be called when connection is restored
}

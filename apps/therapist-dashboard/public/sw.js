// Service Worker for PWA functionality
const CACHE_NAME = 'indastreet-therapist-v1';
const NOTIFICATION_SOUND_URL = 'https://ik.imagekit.io/7grri5v7d/notification-sound.mp3';

// Install event
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Service Worker: Caching assets');
      // Cache assets individually to avoid failing on any single error
      const urlsToCache = [
        '/',
        '/index.html',
        '/manifest.json',
        NOTIFICATION_SOUND_URL
      ];
      
      return Promise.allSettled(
        urlsToCache.map(url => 
          cache.add(url).catch(err => {
            console.warn(`⚠️ Failed to cache ${url}:`, err.message);
            return null;
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Network first, fallback to cache
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
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('📩 Push notification received:', event);
  
  let notificationData = {
    title: 'IndaStreet',
    body: 'You have a new notification',
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    tag: 'indastreet-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        data: {
          url: data.url || '/'
        }
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    Promise.all([
      // Show notification
      self.registration.showNotification(notificationData.title, notificationData),
      
      // Play sound
      playNotificationSound()
    ])
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none exist
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Function to play notification sound
async function playNotificationSound() {
  try {
    // Try to get all clients
    const allClients = await clients.matchAll({ includeUncontrolled: true });
    
    if (allClients.length > 0) {
      // Send message to client to play sound
      allClients.forEach(client => {
        client.postMessage({
          type: 'PLAY_NOTIFICATION_SOUND',
          soundUrl: NOTIFICATION_SOUND_URL
        });
      });
    }
  } catch (error) {
    console.error('❌ Error playing notification sound:', error);
  }
}

// Background sync event (for offline functionality)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Implement message syncing logic here
  console.log('📨 Syncing messages in background...');
}

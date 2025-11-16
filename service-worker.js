// 🔥 CACHE-BUSTING: Update version on every deployment
// Change this version whenever you deploy new code
const CACHE_VERSION = 'v2.0.1'; // INCREMENT THIS ON EVERY DEPLOYMENT!
const CACHE_NAME = `indostreet-massage-cache-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
];

// 🔥 CACHE CLEANUP: Remove old caches on activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('install', event => {
  // 🔥 FORCE ACTIVATION: Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Skip caching for Vite dev server resources
  const url = new URL(event.request.url);
  if (url.pathname.includes('/@') || 
      url.pathname.includes('/node_modules/') ||
      url.pathname.includes('/@vite/') ||
      url.pathname.includes('/@react-refresh') ||
      url.searchParams.has('import')) {
    return;
  }

  // 🔥 NETWORK-FIRST STRATEGY: Always fetch fresh, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response to cache it
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              console.log('📦 Serving from cache:', event.request.url);
              return response;
            }
            // No cache, return error
            console.log('❌ Fetch failed for:', event.request.url);
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

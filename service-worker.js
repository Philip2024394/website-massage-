const CACHE_NAME = 'indostreet-massage-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
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

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(error => {
            console.log('Fetch failed for:', event.request.url);
            // Return a basic response for failed fetches
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

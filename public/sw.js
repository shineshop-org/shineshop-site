// Service worker for Shine Shop

// Cache version - update when deploying new versions
const CACHE_VERSION = 'v1';
const CACHE_NAME = `shineshop-${CACHE_VERSION}`;

// Install event - cache basic resources
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  // Only cache resources that definitely exist
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/favicon.ico'
        // Removed logo files that might not exist
      ]).catch(err => {
        console.warn('Failed to cache some resources:', err);
        // Don't fail the service worker installation if caching fails
        return Promise.resolve();
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  
  // Claim clients to control all tabs immediately
  self.clients.claim();
  
  // Delete old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('shineshop-') && cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Special handling for RSC requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle RSC requests
  if (url.pathname.includes('_rsc') || url.search.includes('_rsc')) {
    // For RSC requests that might fail, return an empty 200 response
    // This prevents the client from seeing RSC fetch errors
    if (event.request.method === 'GET') {
      event.respondWith(
        fetch(event.request)
          .catch(() => {
            // If fetch fails, return an empty response instead of an error
            return new Response('', {
              status: 200,
              headers: { 'Content-Type': 'text/plain' },
            });
          })
      );
      return;
    }
  }
  
  // For all other requests, use the default fetch behavior
  // No additional caching strategy needed as Cloudflare already handles caching
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 
// Service worker to clear cache
const CACHE_VERSION = 'v4';
const IMAGE_DOMAINS = ['ik.imagekit.io', 'images.unsplash.com', 'img.vietqr.io'];

// On install - clear all old caches
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// On activate - claim clients and clear any cached resources
self.addEventListener('activate', function(event) {
  clients.claim();
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Only intercept same-origin requests, skip image domains
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Skip handling external image domains
  if (IMAGE_DOMAINS.some(domain => url.hostname.includes(domain))) {
    return; // Let the browser handle image requests normally
  }
  
  // Only handle same-origin requests
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
  }
}); 
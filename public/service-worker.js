/* Service Worker for PWA functionality */
const CACHE_NAME = 'nd-quiz-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/index.css',
  '/src/mobile-enhancements.css',
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache opened');
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip API requests to external services
  if (event.request.url.includes('supabase') || event.request.url.includes('googleapis')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Network first strategy for other requests
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response for caching
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request) || 
               caches.match('/index.html');
      })
  );
});

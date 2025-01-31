const CACHE_NAME = 'spookify-v1';
const OFFLINE_URL = '/offline.html';
const INDEX_URL = '/index.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([INDEX_URL, OFFLINE_URL]); // Cache only these files
        })
    );
    self.skipWaiting(); // Activate service worker immediately
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse; // Serve cached index.html if available
                    }
                    return caches.match(OFFLINE_URL); // Fallback to offline.html
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Ensure immediate control over open pages
});

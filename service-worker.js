const CACHE_NAME = 'spookify-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/play.html',
    '/down.html',
    
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Fetch from cache or network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // Return cached response if available
                }
                // Otherwise, fetch from the network
                return fetch(event.request)
                    .then((response) => {
                        // Cache the fetched response
                        return caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, response.clone());
                                return response;
                            });
                    });
            })
    );
});

// Clear old caches during activation
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

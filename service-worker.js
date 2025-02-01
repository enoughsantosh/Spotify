const CACHE_NAME = 'spookify-v1';
const OFFLINE_URL = '/offline.html';
const INDEX_URL = '/index.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([INDEX_URL, OFFLINE_URL]); // Cache only these files initially
        })
    );
    self.skipWaiting(); // Activate service worker immediately
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Handle MP3 files separately
    if (url.pathname.endsWith('.mp3')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log("Serving MP3 from cache:", request.url);
                        return cachedResponse;
                    }
                    return fetch(request)
                        .then((networkResponse) => {
                            console.log("Fetching and caching MP3:", request.url);
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        })
                        .catch(() => {
                            console.log("MP3 not available offline:", request.url);
                            return new Response("Audio file not available offline.", {
                                status: 503,
                                statusText: "Service Unavailable"
                            });
                        });
                });
            })
        );
        return;
    }

    // Default fetch behavior with offline fallback
    event.respondWith(
        fetch(request)
            .catch(() => {
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
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

const CACHE_NAME = 'spootify-v1';
const OFFLINE_URL = '/offline.html';
const INDEX_URL = '/index.html';

// Install event - Caches essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll([INDEX_URL, OFFLINE_URL])
                    .catch((error) => console.error("Caching failed:", error));
            })
    );
    self.skipWaiting(); // Activate the service worker immediately
});

// Fetch event - Handles caching and network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.destination === 'audio' || url.pathname.endsWith('.mp3')) {
        event.respondWith(handleAudioRequest(request));
    } else {
        event.respondWith(handleGeneralRequest(request));
    }
});

// Handle audio file requests
async function handleAudioRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        console.log("Serving MP3 from cache:", request.url);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone()); // Cache the audio file
        }
        return networkResponse;
    } catch (error) {
        console.log("MP3 not available offline:", request.url);
        return new Response("Audio file not available offline.", {
            status: 503,
            statusText: "Service Unavailable"
        });
    }
}

// Handle general requests with an offline fallback
async function handleGeneralRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        return await fetch(request);
    } catch (error) {
        if (request.mode === 'navigate') {
            // Serve offline page if navigating
            return cache.match(OFFLINE_URL);
        }
        return new Response("Offline content unavailable.", {
            status: 503,
            statusText: "Service Unavailable"
        });
    }
}

// Activate event - Clears old caches and takes control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
    self.clients.claim(); // Take control of clients immediately
});

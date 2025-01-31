const CACHE_NAME = 'spookify-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/play.html',
    '/down.html',
    '/offline.html', // Add offline fallback page
];

// Install Service Worker and cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('spookify-offline').then((cache) => {
            return cache.add('/offline.html'); // Only cache offline fallback page
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match('/offline.html'))
    );
});

// Ensure old caches are removed
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        })
    );
});

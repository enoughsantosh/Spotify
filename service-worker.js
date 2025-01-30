// service-worker.js
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("audio-cache").then((cache) => {
      return cache.addAll(["/audio/sample.mp3"]); // Pre-cache the audio file
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

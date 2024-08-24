/* eslint-disable no-restricted-globals */

const CACHE_NAME = "milk-tracker-cache";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/js/main.js",
  // Add more assets to cache here
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

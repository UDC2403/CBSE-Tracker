/**
 * CBSE Class 9 & 10 Study Tracker - Service Worker
 * Precaches app shell only. Cache cleanup is restricted to this app's cache namespace.
 */

const CACHE_NAME = "sunil-bhaiya-tracker-v5";
const CACHE_PREFIX = "sunil-bhaiya-tracker-";

const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/data/stages.js",
  "./js/data/chapters-class9.js",
  "./js/data/chapters-class10.js",
  "./js/storage.js",
  "./js/planner.js",
  "./js/insights.js",
  "./js/app.js",
  "./assets/icons/logo.svg",
  "./assets/icons/logo-maskable.svg",
  "./assets/icons/apple-touch-icon.png",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Do not cache PDFs or cross-origin requests.
  if (url.origin !== self.location.origin ||
      url.pathname.toLowerCase().endsWith(".pdf") ||
      url.pathname.includes("/assets/pdfs/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        return networkResponse;
      });
    })
  );
});

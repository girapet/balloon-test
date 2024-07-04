const VERSION = '1.0.1';

const precacheUrls = [
  '/css/common.css',
  '/css/index.css',
  '/css/map.css',
  '/js/data-store.js',
  '/js/dom.js',
  '/js/index.js',
  '/js/map.js',
  '/js/network.js',
  '/js/survey-area.js',
  '/index.html',
  '/intro.html',
  '/map.html',
  '/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(precacheUrls))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => cacheNames.filter(cacheName => cacheName !== VERSION))
      .then(cachesToDelete => Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    const requestUrl = new URL(event.request.url);

    if (precacheUrls.includes(requestUrl.pathname)) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => cachedResponse)
      );
    }
  }
});
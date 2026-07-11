---
---
const BASE = '{{ "/" | relative_url }}';
const CACHE_NAME = 'clean-blog-v9';

const PRECACHE_URLS = [
  BASE,
  BASE + 'assets/main.css',
  BASE + 'assets/scripts.js',
  BASE + 'manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;

  // Only handle same-origin GET requests. Cross-origin requests (Formspree, any
  // third-party API) are left alone so the browser handles them normally.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  const isStaticAsset = request.url.indexOf('/assets/') !== -1 || request.url.indexOf('/img/') !== -1 || request.url.indexOf('/fonts/') !== -1;

  if (isStaticAsset) {
    // Cache-first for static assets: they're fingerprint-free here, but rarely change.
    event.respondWith(
      caches.match(request).then(function (cached) {
        return cached || fetch(request).then(function (response) {
          return caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Network-first for pages, falling back to cache so previously visited
  // pages stay readable offline.
  event.respondWith(
    fetch(request).then(function (response) {
      return caches.open(CACHE_NAME).then(function (cache) {
        cache.put(request, response.clone());
        return response;
      });
    }).catch(function () {
      return caches.match(request);
    })
  );
});

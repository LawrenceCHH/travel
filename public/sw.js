const BASE = '/travel/';
const CACHE_NAME = 'clean-blog-v23';

// 預快取路徑，Vite build 時會被 swPrecachePlugin 自動取代為含有雜湊碼的檔案名
const PRECACHE_URLS = [
  BASE,
  BASE + 'assets/tailwind.css',
  BASE + 'assets/scripts.js',
  BASE + 'manifest.json',
  BASE + 'components/navbar.html',
  BASE + 'components/footer.html',
  BASE + 'data/posts.json'
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

  // 僅快取同源 GET 請求
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  const isStaticAsset = request.url.indexOf('/assets/') !== -1 || request.url.indexOf('/img/') !== -1 || request.url.indexOf('/fonts/') !== -1;

  if (isStaticAsset) {
    // 靜態資源優先快取
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

  // 頁面及其他請求網路優先，失敗則回退快取以支援離線瀏覽
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

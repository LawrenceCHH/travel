const BASE = '/travel/';
// 2026-07-26（doc/archive/suggestion.md S13）：此處版本號僅為開發模式佔位值——本機
// localhost 開發時 scripts.js 一律自動 unregister SW（見該檔第 3 節），不會讀到這裡的值。
// 正式 build 時由 vite.config.js 的 swPrecachePlugin 依打包後 CSS/JS 檔名雜湊自動覆寫，
// 不再需要手動遞增，避免忘記 bump 導致訪客卡在舊快取（歷史上已出過線上事故）。
const CACHE_NAME = 'clean-blog-dev';

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

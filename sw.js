const CACHE_NAME = "molkky-app-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

// インストール時
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// リクエスト時（オフライン対応）
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
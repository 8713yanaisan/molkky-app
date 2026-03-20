const CACHE_NAME = "molkky-app-v3";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

// インストール
self.addEventListener("install", event => {
  self.skipWaiting(); // ★即反映
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// アクティベート
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // ★即制御
  );
});

// フェッチ
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
const CACHE_NAME = 'fsp-rostock-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './Anamnese.html',
  './Briefvorlagen.html',
  './Finale.html',
  './Arzt_Patient-Arzt_Arzt.html',
  './FSP_Fachbegriffe_NachSystem.html',
  './OP_und_Untersuchungen.html',
  './fsp_lernkarten.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// Installation: alle Seiten in den Cache legen
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Aktivierung: alte Caches aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: zuerst Cache, dann Netzwerk (Offline-First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET' && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        // Falls offline und nicht im Cache: zur Startseite zurückfallen
        return caches.match('./index.html');
      });
    })
  );
});

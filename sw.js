// Service Worker — Mika & Diego · Casamento 2026
const CACHE_NAME = 'casamento-2026-v2';

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH — só cacheia arquivos do próprio domínio
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Ignora tudo que não é do mesmo domínio (Firebase, APIs, Google Fonts etc)
  if (url.origin !== self.location.origin) return;
  
  // Só cacheia GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    )
  );
});

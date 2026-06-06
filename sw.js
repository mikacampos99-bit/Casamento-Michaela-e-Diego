// Service Worker — Mika & Diego · Casamento 2026
const CACHE_NAME = 'casamento-2026-v3';
const BASE = '/Casamento-Michaela-e-Diego';

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        BASE + '/index.html',
        BASE + '/manifest.json',
        BASE + '/icon-192.png',
        BASE + '/icon-512.png',
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

// ACTIVATE — limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH — só cacheia arquivos do mesmo domínio/subpasta
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignora tudo externo (Firebase, APIs, Google Fonts)
  if (url.origin !== self.location.origin) return;

  // Só GET
  if (event.request.method !== 'GET') return;

  // Rota raiz / redireciona para o index correto
  if (url.pathname === BASE + '/' || url.pathname === BASE) {
    event.respondWith(
      caches.match(BASE + '/index.html').then(r => r || fetch(BASE + '/index.html'))
    );
    return;
  }

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

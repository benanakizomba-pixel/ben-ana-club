const CACHE_NAME = 'ben-ana-club-v12';
const APP_SHELL = [
  './',
  './index.html',
  './index-seguranca.html',
  './membros.html',
  './offline.html',
  './manifest.webmanifest',
  './pwa-register.js',
  './assets/pwa-icon-192.png',
  './assets/pwa-icon-512.png',
  './assets/stories/aulas.jpg',
  './assets/stories/baila-morena.jpg',
  './assets/stories/ben-ana-musicas-originais.png',
  './assets/stories/eventos.jpeg',
  './assets/stories/ginga-noel-soiree-2026.jpg',
  './assets/stories/ginga-noel-masterclass-2026.jpg',
  './assets/stories/aquae-flavie-2026.jpg',
  './assets/stories/kem-algarve-2027.png',
  './assets/stories/playlist.jpg',
  './assets/stories/videos.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('ben-ana-club-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage || caches.match('./offline.html');
        })
    );
    return;
  }

  if (/\.mp4$/i.test(url.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

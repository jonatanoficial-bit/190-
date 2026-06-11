const BUILD_ID = 'CENTRAL190-0100-20260611-1907-BRT';
const CACHE_PREFIX = 'central190-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`;
const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './css/premium-v010.css',
  './js/app.js',
  './js/build-info.js',
  './js/data/content.js',
  './js/core/utils.js',
  './js/core/content-validator.js',
  './js/core/save-manager.js',
  './js/core/runtime-guard.js',
  './js/core/diagnostics.js',
  './js/core/i18n.js',
  './js/i18n/translations.js',
  './js/i18n/content-translations.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/backgrounds/bg-home-city-night.webp',
  './assets/backgrounds/bg-control-room-lobby.webp',
  './assets/backgrounds/bg-control-room-hall.webp'
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
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response?.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match('./index.html'));
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response?.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const destination = event.request.destination;
  if (event.request.mode === 'navigate' || ['script', 'style', 'manifest'].includes(destination)) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(cacheFirst(event.request));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

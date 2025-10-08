/* TagRep PWA service worker */
const VERSION = 'tagrep-v1-2025-10-08';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/pwa-192.png',
  './icons/pwa-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))))
  ;
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // For navigations, try network first; fall back to cached index when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for core assets
  if (ASSETS.some(path => req.url.endsWith(path.replace('./','')))) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
    return;
  }

  // Default: network-first with cache fallback
  event.respondWith(
    fetch(req).then(res => {
      const clone = res.clone();
      caches.open(VERSION).then(cache => cache.put(req, clone));
      return res;
    }).catch(() => caches.match(req))
  );
});

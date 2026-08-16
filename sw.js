const CACHE_NAME = 'renacer-cache-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles/main.css',
  './src/main.js',
  './src/core/db.js',
  './src/core/crypto.js',
  './src/core/supabase.js',
  './src/game/character.js',
  './src/game/inventory.js',
  './src/game/skills.js',
  './src/game/npc.js',
  './src/game/world.js',
  './src/game/story.js',
  './src/game/multiplayer.js',
  './src/ui/renderer.js',
  './src/ui/onboarding.js',
  './public/icons/icon-192x192.png',
  './public/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Algunos archivos estáticos de Renacer no se pudieron precargar:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Excluir Supabase y peticiones de autenticación/API para evitar problemas de CORS
  if (url.hostname.includes('supabase.co') || event.request.method !== 'GET') {
    return;
  }

  // Network-first falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return new Response('Offline: Recurso no cacheado', { status: 503 });
        });
      })
  );
});

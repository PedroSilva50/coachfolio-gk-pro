const CACHE_NAME = 'coachfolio-gkpro-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './js/dicionario.js',
  './js/equipa.js',
  './js/jogo.js',
  './js/modulo_gr.js',
  './js/planeamento.js',
  './js/storage.js',
  './js/tatica.js',
  './js/vistas.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Instalação (Guarda os ficheiros em cache)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Ativação (Limpa caches antigas se houver atualizações)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch (Lê da cache se não houver internet)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Se encontrar na cache, devolve. Senão, vai à rede.
      return response || fetch(event.request);
    })
  );
});
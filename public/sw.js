const CACHE_NAME = 'kids-game-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dagen

const urlsToCache = [
  '/',
  '/correct.mp3',
  '/incorrect.mp3',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png'
];

// Valideer de cache-entry
const isValidCacheEntry = (response) => {
  if (!response) return false;
  const fetchDate = response.headers.get('sw-fetched-on');
  if (!fetchDate) return false;

  const age = Date.now() - new Date(fetchDate).getTime();
  return age < CACHE_DURATION;
};

// Voeg timestamp toe aan response
const addTimestampToResponse = (response) => {
  const headers = new Headers(response.headers);
  headers.append('sw-fetched-on', new Date().toISOString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geopend');
        return Promise.all(
          urlsToCache.map(url =>
            fetch(url)
              .then(response => {
                if (!response.ok) {
                  console.error(`Fout bij ophalen ${url}:`, response.status);
                  throw new Error(`Failed to fetch ${url}`);
                }
                console.log(`${url} succesvol gecached`);
                return cache.put(url, addTimestampToResponse(response));
              })
              .catch(error => {
                console.error('Cache mislukt voor:', url, error);
                return Promise.resolve(); // Voorkom dat één fout alles blokkeert
              })
          )
        );
      })
      .then(() => {
        console.log('Service worker installatie voltooid');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Oude cache verwijderen:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service worker nu actief');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Alleen GET requests cachen
  if (event.request.method !== 'GET') return;

  // Controleer of de URL veilig is
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAudioFile = url.pathname.endsWith('.mp3');
  const isStaticAsset = url.pathname.startsWith('/_next/static/') ||
                       url.pathname.startsWith('/static/') ||
                       url.pathname.endsWith('.json') ||
                       url.pathname.endsWith('.ico') ||
                       url.pathname.endsWith('.png');

  // Alleen zelfde origin en statische/audio bestanden cachen
  if (!isSameOrigin || (!isStaticAsset && !isAudioFile && url.pathname !== '/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Voor audio bestanden, gebruik altijd cache als beschikbaar
        if (isAudioFile && cachedResponse) {
          return cachedResponse;
        }

        // Voor andere bestanden, controleer cache validiteit
        if (cachedResponse && isValidCacheEntry(cachedResponse)) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              console.warn(`Fout bij ophalen ${url.pathname}:`, response?.status);
              return response;
            }

            // Cache de nieuwe response
            const responseToCache = addTimestampToResponse(response.clone());
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log(`${url.pathname} succesvol gecached`);
              })
              .catch(error => console.error('Cache update mislukt:', error));

            return response;
          })
          .catch(error => {
            console.error('Fetch mislukt:', error);
            // Gebruik verlopen cache als fallback
            if (cachedResponse) {
              console.log('Gebruik verlopen cache als fallback voor:', url.pathname);
              return cachedResponse;
            }
            throw error;
          });
      })
  );
});
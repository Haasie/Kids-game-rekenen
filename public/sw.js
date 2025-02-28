const CACHE_NAME = 'kids-game-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dagen

const urlsToCache = [
  '/',
  '/correct.mp3',
  '/incorrect.mp3',
  '/_next/static/',
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
        return Promise.all(
          urlsToCache.map(url =>
            fetch(url)
              .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                return cache.put(url, addTimestampToResponse(response));
              })
              .catch(error => console.error('Cache failed:', error))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Alleen GET requests cachen
  if (event.request.method !== 'GET') return;

  // Controleer of de URL veilig is
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isStaticResource = url.pathname.startsWith('/_next/') ||
                          url.pathname.endsWith('.mp3') ||
                          url.pathname === '/';

  if (!isSameOrigin && !isStaticResource) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Controleer cache validiteit
        if (cachedResponse && isValidCacheEntry(cachedResponse)) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = addTimestampToResponse(response.clone());
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => console.error('Cache update failed:', error));

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // Retourneer verlopen cache als fallback
            if (cachedResponse) {
              return cachedResponse;
            }
            throw error;
          });
      })
  );
});
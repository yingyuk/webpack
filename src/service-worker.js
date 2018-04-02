/* eslint-disable */
const DEBUG = true;

const { assets } = global.serviceWorkerOption;

const CACHE_NAME = new Date().toISOString();

let assetsToCache = [...assets, './'];

assetsToCache = assetsToCache.map(path =>
  new URL(path, global.location).toString()
);

// When the service worker is first added to a computer.
self.addEventListener('install', event => {
  // Perform install steps.
  if (DEBUG) {
    console.info('[SW] Install event');
  }

  // Add core website files to cache during serviceworker installation.
  event.waitUntil(
    global.caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(assetsToCache))
      .then(() => {
        self.skipWaiting();
        if (DEBUG) {
          console.info('Cached assets: main', assetsToCache);
        }
      })
      .catch(error => {
        console.error(error);
        throw error;
      })
  );
});

// After the install event.
self.addEventListener('activate', event => {
  if (DEBUG) {
    console.info('[SW] Activate event');
  }

  // Clean the caches
  event.waitUntil(
    global.caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          // Delete the caches that are not the current one.
          if (cacheName.indexOf(CACHE_NAME) === 0) {
            return null;
          }

          return global.caches.delete(cacheName);
        })
      )
    )
  );
});

self.addEventListener('message', event => {
  switch (event.data.action) {
    case 'skipWaiting':
      if (self.skipWaiting) {
        self.skipWaiting();
        self.clients.claim();
      }
      break;
    default:
      break;
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Ignore not GET request.
  if (request.method !== 'GET') {
    if (DEBUG) {
      console.info(`[SW] Ignore non GET request ${request.method}`);
    }
    return;
  }

  const requestUrl = new URL(request.url);

  // Ignore difference origin.
  if (requestUrl.origin !== location.origin) {
    if (DEBUG) {
      console.info(`[SW] Ignore difference origin ${requestUrl.origin}`);
    }
    return;
  }

  const resource = global.caches.match(request).then(response => {
    if (response) {
      if (DEBUG) {
        console.info(`[SW] fetch URL ${requestUrl.href} from cache`);
      }

      return response;
    }

    // Load and cache known assets.
    return fetch(request)
      .then(responseNetwork => {
        if (!responseNetwork || !responseNetwork.ok) {
          if (DEBUG) {
            console.info(
              `[SW] URL [${requestUrl.toString()}] wrong responseNetwork: ${
                responseNetwork.status
              } ${responseNetwork.type}`
            );
          }

          return responseNetwork;
        }

        if (DEBUG) {
          console.info(`[SW] URL ${requestUrl.href} fetched`);
        }

        const responseCache = responseNetwork.clone();

        global.caches
          .open(CACHE_NAME)
          .then(cache => cache.put(request, responseCache))
          .then(() => {
            if (DEBUG) {
              console.info(`[SW] Cache asset: ${requestUrl.href}`);
            }
          });

        return responseNetwork;
      })
      .catch(() => {
        // User is landing on our page.
        if (event.request.mode === 'navigate') {
          return global.caches.match('./');
        }

        return null;
      });
  });

  event.respondWith(resource);
});

/* The build replaces these constants. No form answers or generated PDFs are cached. */
const version = __VERSION__;
const assets = __ASSETS__;
const scope = self.registration.scope;
const prefix = `woollahra:${scope}:`;
const cacheName = prefix + version;
const urls = assets.map(path => new URL(path, scope).href);
const assetURLs = new Set(urls);
const indexURL = new URL('index.html', scope).href;

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      // One unavailable asset or storage failure must not prevent installation.
      await Promise.allSettled(
        urls.map(async url => {
          const response = await fetch(new Request(url, { cache: 'reload' }));
          if (!response.ok || response.redirected) return;
          const cache = await caches.open(cacheName);
          await cache.put(url, response);
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        for (const name of await caches.keys()) {
          if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
        }
      } catch {
        // Network access still works when browser storage is unavailable.
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const appURL = new URL(scope);
  // Only handle this app's document and manifest assets, never other sites or blob PDFs.
  const isDocument =
    request.mode === 'navigate' &&
    url.origin === appURL.origin &&
    (url.pathname === appURL.pathname || url.pathname === new URL(indexURL).pathname);
  if (!isDocument && !assetURLs.has(url.href)) return;

  const key = isDocument ? indexURL : request.url;
  const network = fetch(request, { cache: 'no-cache' });

  // Save a copy in the background; never delay a network response for storage.
  event.waitUntil(
    network
      .then(async response => {
        if (!response.ok || response.redirected) return;
        const copy = response.clone();
        const cache = await caches.open(cacheName);
        await cache.put(key, copy);
      })
      .catch(() => {}),
  );

  event.respondWith(
    (async () => {
      let response;
      let failure;
      try {
        response = await network;
        if (response.ok) return response;
      } catch (error) {
        failure = error;
      }
      try {
        const cache = await caches.open(cacheName);
        // Prefetched files and font/module requests can have different Origin headers.
        const cached = await cache.match(key, { ignoreVary: true });
        if (cached) return cached;
      } catch {
        // Preserve the original network result if storage is unavailable.
      }
      if (response) return response;
      throw failure;
    })(),
  );
});

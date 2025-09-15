// ---- version & cache names ----
// We derive CACHE_NAME at install time from /version.txt so each release gets a fresh cache.
const CACHE_NAME_BASE = 'et-static-images';
let RUNTIME_CACHE_NAME = `${CACHE_NAME_BASE}-dev`; // default until we learn real version
const PRECACHE_URLS = [
  '/',
  '/favicon.ico',
  '/icons/dark.svg',
  '/icons/light.svg',
  '/icons/sponsor.svg'
];

// ---- helper to get app version ----
async function getAppVersion() {
  try {
    const res = await fetch('/version.txt', { cache: 'no-cache' });
    if (!res.ok) throw new Error('no version');
    const txt = (await res.text()).trim();
    return txt || 'dev';
  } catch {
    return 'dev';
  }
}

// ---- SW lifecycle: skip waiting & claim ----
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const ver = await getAppVersion();
    RUNTIME_CACHE_NAME = `${CACHE_NAME_BASE}-${ver}`;
    const cache = await caches.open(RUNTIME_CACHE_NAME);
    try { await cache.addAll(PRECACHE_URLS); } catch {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      const isOurCache = k.startsWith(CACHE_NAME_BASE + '-');
      if (isOurCache && k !== RUNTIME_CACHE_NAME) {
        return caches.delete(k);
      }
      return Promise.resolve();
    }));
    await self.clients.claim();
  })());
});

// ---- Runtime caching for images in /public ----
// Strategy: cache-first for same-origin images (fast offline), then fall back to network.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Cache only same-origin images (things under /images, /icons, etc. served from /public)
  const isImage = req.destination === 'image'
    || url.pathname.startsWith('/images/')
    || url.pathname.startsWith('/icons/');

  if (sameOrigin && isImage) {
    event.respondWith(
      caches.open(RUNTIME_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req, { ignoreVary: true });
        if (cached) return cached;

        try {
          const resp = await fetch(req, { cache: 'no-cache' });
          // Only cache successful responses
          if (resp && resp.ok) cache.put(req, resp.clone());
          return resp;
        } catch {
          // Optionally return a placeholder/fallback image here
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // Optional (advanced): add stale-while-revalidate for CSS/JS or other assets here if desired.
});
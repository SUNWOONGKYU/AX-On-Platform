// @task S8F1 — AX-On Platform Service Worker
// Cache strategy:
//   - Static assets (CSS, JS, images): Cache-first
//   - HTML pages & API calls: Network-first
//   - Offline fallback: offline.html

'use strict';

const CACHE_NAME = 'axon-cache-v1';
const OFFLINE_URL = '/offline.html';

// Critical assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/ax-project.html',
  '/offline.html',
  '/manifest.json'
];

// Static asset extensions — matched for Cache-first strategy
const STATIC_EXTENSIONS = /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)(\?.*)?$/i;

// API origin patterns — matched for Network-first strategy
const API_PATTERNS = [
  /supabase\.co/,
  /\/api\//
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing — cache:', CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching critical assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Force waiting SW to become active immediately
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('[SW] Precache failed (some assets may not exist yet):', err);
        // skipWaiting even if precache partially fails
        return self.skipWaiting();
      })
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating — cleaning old caches');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all open clients immediately
        return self.clients.claim();
      })
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle http/https requests
  if (!url.protocol.startsWith('http')) return;

  // Determine routing strategy
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    // HTML pages and unknown — Network-first
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

// ─── Strategy: Cache-first ───────────────────────────────────────────────────
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Cache-first fetch failed:', request.url, err);
    throw err;
  }
}

// ─── Strategy: Network-first ─────────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Network-first falling back to cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw err;
  }
}

// ─── Strategy: Network-first + offline.html fallback ─────────────────────────
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Network failed, checking cache:', request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Serve offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_URL);
      if (offlinePage) return offlinePage;
    }

    throw err;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isStaticAsset(url) {
  return STATIC_EXTENSIONS.test(url.pathname);
}

function isApiRequest(url) {
  return API_PATTERNS.some((pattern) => pattern.test(url.href));
}

/* Offline cache for the weather app. Plain JS on purpose: it is served as-is, outside the bundle.
 * - Page and built assets: network first (so a new deploy is picked up), cache as the offline fallback.
 * - Open-Meteo answers: network first, last good answer kept for offline use.
 * Bump VERSION to drop every old cache. */
const VERSION = "v1";
const SHELL_CACHE = `weather-shell-${VERSION}`;
const DATA_CACHE = `weather-data-${VERSION}`;
const MAX_DATA_ENTRIES = 60;
const BASE = new URL("./", self.location).pathname;
const API_HOSTS = ["api.open-meteo.com", "geocoding-api.open-meteo.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([BASE, `${BASE}icon.svg`]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n.startsWith("weather-") && n !== SHELL_CACHE && n !== DATA_CACHE)
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  await Promise.all(
    keys.slice(0, Math.max(0, keys.length - MAX_DATA_ENTRIES)).map((k) => cache.delete(k)),
  );
}

async function networkFirst(request, cacheName, fallbackKey) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      if (cacheName === DATA_CACHE) await trim(cache);
    }
    return response;
  } catch (err) {
    const cached =
      (await cache.match(request)) ?? (fallbackKey ? await cache.match(fallbackKey) : undefined);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(networkFirst(request, DATA_CACHE));
  } else if (url.origin === self.location.origin && url.pathname.startsWith(BASE)) {
    event.respondWith(
      networkFirst(request, SHELL_CACHE, request.mode === "navigate" ? BASE : undefined),
    );
  }
});

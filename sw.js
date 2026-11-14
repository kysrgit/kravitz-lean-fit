/**
 * Dosya: sw.js
 * Açıklama: Çevrimdışı (bodrum kat salonlar dahil) kullanım için PWA Service Worker.
 * Uygulama kabuğu dosyalarında cache-first, veri dosyasında (data.js) stale-while-revalidate stratejisi uygular;
 * üçüncü taraf veya lisanssız medya dosyalarını kesinlikle önbelleğe almaz.
 */

const SHELL_CACHE = "klf-shell-v3";
const DATA_CACHE = "klf-data-v3";

const APP_SHELL_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./styles/tokens.css",
  "./styles/base.css",
  "./styles/components/broadcast-bar.css",
  "./styles/components/hero.css",
  "./styles/legacy-bridge.css",
  "./styles/motion.css",
  "./app.js",
  "./src/state.js",
  "./src/media.js",
  "./src/modal.js",
  "./src/render/icons.js",
  "./src/render/cards.js",
  "./src/render/sections.js",
  "./src/render/index.js",
  "./assets/noise.svg",
  "./assets/fonts/inter-latin.woff2",
  "./assets/fonts/inter-latin-ext.woff2",
  "./assets/fonts/big-shoulders-display-latin.woff2",
  "./assets/fonts/big-shoulders-display-latin-ext.woff2",
  "./manifest.webmanifest",
  "./icons/icon.svg",
];

// Üçüncü taraf veya lisanssız medya yollarını tespit eder (önbelleğe alınmaz)
function isUnlicensedOrMediaRequest(url) {
  if (url.origin !== self.location.origin) return true;
  return (
    /\.(mp4|webm|mov|avi|mkv|jpg|jpeg|png|gif)$/i.test(url.pathname) ||
    url.pathname.includes("/assets/videos") ||
    url.pathname.includes("/assets/images")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)),
      caches.open(DATA_CACHE).then((cache) => cache.add("./data.js")),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const validCaches = new Set([SHELL_CACHE, DATA_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !validCaches.has(key)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isUnlicensedOrMediaRequest(url)) {
    return;
  }

  // Veri dosyası için stale-while-revalidate
  if (url.pathname.endsWith("/data.js")) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // Uygulama kabuğu (index, styles, js, manifest, svg, yerel fontlar) için cache-first
  event.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response && response.ok && response.type === "basic") {
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        if (request.mode === "navigate") {
          return cache.match("./index.html");
        }
        return undefined;
      }
    })
  );
});

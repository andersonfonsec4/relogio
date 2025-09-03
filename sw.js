// Versão do cache — altere quando mudar os assets
const CACHE = "relogio-v3-2025-09-03";

// Arquivos a pré-cachear
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "favicon.svg",
  "manifest.json",
  "og-image.png",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

// Instalação: pré-cache
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

// Ativação: limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// HTML: network-first | Outros: cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("./", copy));
        return res;
      }).catch(() => caches.match("./"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const okToCache = res && res.status === 200 && res.type === "basic";
        if (okToCache) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached || Promise.reject("offline"))
    })
  );
});

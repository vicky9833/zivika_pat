const CACHE_NAME = "zivika-v2";

self.addEventListener("install", () => {
  // Skip the waiting phase immediately.
  // We intentionally do NOT call cache.addAll() here because
  // cacheable routes redirect when unauthenticated and that causes
  // the install to fail with a TypeError, breaking the PWA entirely.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("/api/")) return;
  if (event.request.url.includes("convex.cloud")) return;
  if (event.request.url.includes("clerk")) return;
  if (event.request.url.includes("googleapis.com")) return;
  if (event.request.url.includes("groq.com")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

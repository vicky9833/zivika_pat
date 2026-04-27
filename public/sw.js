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
  if (event.request.url.includes("nvidia.com")) return;
  if (event.request.url.includes("openrouter.ai")) return;
  // Never cache auth or setup routes — always fetch fresh
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/auth") || url.pathname.startsWith("/setup") || url.pathname.startsWith("/sso-callback")) return;

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
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Return a minimal offline response instead of crashing
          return new Response("Offline", { status: 503, statusText: "Offline", headers: { "Content-Type": "text/plain" } });
        });
      })
  );
});

// Push notification service worker — handles background push events
// Registered separately from the workbox SW (different scope /b/ and /c/)

self.addEventListener("push", function (event) {
  if (!event.data) return;
  let payload = { title: "Aether Notify", body: "", data: {} };
  try { payload = event.data.json(); } catch (_) { payload.body = event.data.text(); }

  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.data?.tag || "aether-notify",
    renotify: true,
    data: payload.data || {},
    actions: payload.data?.actions || [],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Skip waiting so the SW activates immediately
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));

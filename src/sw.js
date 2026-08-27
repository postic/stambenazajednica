importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js"
);

// =========================================================
// WORKBOX
// =========================================================

if (typeof workbox !== "undefined") {
  console.log(
    "[Service Worker] Workbox učitan."
  );

  workbox.precaching.precacheAndRoute(
    self.__WB_MANIFEST || []
  );

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "document",
    new workbox.strategies.NetworkFirst({
      cacheName: "pages",
    })
  );

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "style" ||
      request.destination === "script",
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: "assets",
      })
  );
}

// =========================================================
// INSTALL / ACTIVATE
// =========================================================

self.addEventListener(
  "install",
  () => {
    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      self.clients.claim()
    );
  }
);

// =========================================================
// WEB PUSH
// =========================================================

self.addEventListener(
  "push",
  (event) => {
    let data = {
      title: "Komšija",
      body: "Imate novu notifikaciju.",
      url: "/",
    };

    if (event.data) {
      try {
        data = {
          ...data,
          ...event.data.json(),
        };
      } catch {
        data.body = event.data.text();
      }
    }

    const title =
      data.title || "Komšija";

    const options = {
      body:
        data.body ||
        "Imate novu notifikaciju.",

      icon:
        data.icon ||
        "/icons/icon-192.png",

      badge:
        data.badge ||
        "/icons/icon-192.png",

      data: {
        url:
          data.url || "/",
      },

      requireInteraction:
        false,
    };

    event.waitUntil(
      self.registration.showNotification(
        title,
        options
      )
    );
  }
);

// =========================================================
// NOTIFICATION CLICK
// =========================================================

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url ||
      "/";

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (const client of clientList) {
            if (
              "focus" in client
            ) {
              client.navigate(url);

              return client.focus();
            }
          }

          if (
            self.clients.openWindow
          ) {
            return self.clients.openWindow(
              url
            );
          }

          return undefined;
        })
    );
  }
);

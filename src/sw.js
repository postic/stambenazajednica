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

  // IMPORTANT:
  // next-pwa / InjectManifest ubacuje manifest
  // upravo na ovu liniju.
  workbox.precaching.precacheAndRoute(
    self.__WB_MANIFEST
  );

  // =======================================================
  // DOCUMENTS
  // =======================================================

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "document",

    new workbox.strategies.NetworkFirst({
      cacheName: "pages",
    })
  );

  // =======================================================
  // CSS / JS
  // =======================================================

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
// INSTALL
// =========================================================

self.addEventListener(
  "install",
  (event) => {
    console.log(
      "[Service Worker] Install."
    );

    self.skipWaiting();
  }
);

// =========================================================
// ACTIVATE
// =========================================================

self.addEventListener(
  "activate",
  (event) => {
    console.log(
      "[Service Worker] Activate."
    );

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
    console.log(
      "[Service Worker] PUSH event."
    );

    let data = {
      title: "Komšija",
      body:
        "Imate novu notifikaciju.",
      url: "/",
      icon:
        "/icons/icon-192.png",
      badge:
        "/icons/icon-192.png",
    };

    // =======================================================
    // READ PUSH DATA
    // =======================================================

    if (event.data) {
      try {
        const json =
          event.data.json();

        data = {
          ...data,
          ...json,
        };
      } catch {
        try {
          data.body =
            event.data.text();
        } catch {
          // Ignore invalid payload.
        }
      }
    }

    // =======================================================
    // NOTIFICATION OPTIONS
    // =======================================================

    const title =
      data.title ||
      "Komšija";

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

    // =======================================================
    // SHOW NOTIFICATION
    // =======================================================

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
    console.log(
      "[Service Worker] Notification click."
    );

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
        .then(
          (clientList) => {
            // =================================================
            // EXISTING WINDOW
            // =================================================

            for (
              const client of clientList
            ) {
              if (
                "navigate" in client
              ) {
                client.navigate(
                  url
                );

                return client.focus();
              }
            }

            // =================================================
            // NEW WINDOW
            // =================================================

            if (
              self.clients.openWindow
            ) {
              return self.clients.openWindow(
                url
              );
            }

            return undefined;
          }
        )
    );
  }
);

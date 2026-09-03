importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js"
);

// ============================================================
// SERVICE WORKER
// ============================================================

console.log("[Service Worker] Učitavanje...");

// ============================================================
// WORKBOX
// ============================================================

if (typeof workbox !== "undefined") {
  console.log("[Service Worker] Workbox učitan.");

  // ==========================================================
  // SERVICE WORKER LIFECYCLE
  // ==========================================================

  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // ==========================================================
  // PRECACHE
  // ==========================================================
  //
  // next-pwa / InjectManifest automatski ubacuje
  // self.__WB_MANIFEST prilikom builda.
  //

  workbox.precaching.precacheAndRoute(
    self.__WB_MANIFEST
  );

  // ==========================================================
  // DOCUMENTS
  // ==========================================================

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "document",

    new workbox.strategies.NetworkFirst({
      cacheName: "pages",
    })
  );

  // ==========================================================
  // CSS / JS
  // ==========================================================

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "style" ||
      request.destination === "script",

    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "assets",
    })
  );
} else {
  console.error(
    "[Service Worker] Workbox nije učitan."
  );
}

// ============================================================
// INSTALL
// ============================================================

self.addEventListener(
  "install",
  (event) => {
    console.log(
      "[Service Worker] Install."
    );

    self.skipWaiting();
  }
);

// ============================================================
// ACTIVATE
// ============================================================

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

// ============================================================
// WEB PUSH
// ============================================================

self.addEventListener(
  "push",
  (event) => {
    console.log(
      "[Service Worker] PUSH event."
    );

    let data = {
      title: "Komšija",
      body: "Imate novu notifikaciju.",
      url: "/",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    };

    // ========================================================
    // READ PUSH DATA
    // ========================================================

    if (event.data) {
      try {
        const json =
          event.data.json();

        data = {
          ...data,
          ...json,
        };
      } catch (error) {
        console.log(
          "[Service Worker] Push nije JSON, koristim tekst."
        );

        try {
          data.body =
            event.data.text();
        } catch (textError) {
          console.error(
            "[Service Worker] Ne mogu da pročitam push podatke:",
            textError
          );
        }
      }
    }

    // ========================================================
    // NOTIFICATION DATA
    // ========================================================

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
          data.url ||
          "/",
      },

      requireInteraction: false,
    };

    // ========================================================
    // SHOW NOTIFICATION
    // ========================================================

    event.waitUntil(
      self.registration.showNotification(
        title,
        options
      )
    );
  }
);

// ============================================================
// NOTIFICATION CLICK
// ============================================================

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
        .then((clients) => {
          // ==================================================
          // AKO JE APLIKACIJA VEĆ OTVORENA
          // ==================================================

          for (const client of clients) {
            if (
              "navigate" in client
            ) {
              return client
                .navigate(url)
                .then(() =>
                  client.focus()
                );
            }
          }

          // ==================================================
          // AKO APLIKACIJA NIJE OTVORENA
          // ==================================================

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

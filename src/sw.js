// =========================================================
// WEB PUSH
// =========================================================

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    const title =
      data.title || "Obaveštenje";

    const options = {
      body: data.body || "",
      icon: data.icon || "/icons/icon-192x192.png",
      badge: data.badge || "/icons/icon-192x192.png",

      data: {
        url: data.url || "/",
      },

      tag: data.tag || "webpush",
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(
        title,
        options
      )
    );
  } catch (error) {
    console.error(
      "Push event error:",
      error
    );
  }
});

// =========================================================
// KLIK NA NOTIFIKACIJU
// =========================================================

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification?.data?.url || "/";

    event.waitUntil(
      clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      }).then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
);

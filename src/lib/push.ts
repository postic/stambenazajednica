// =========================================================
// WEB PUSH CLIENT
// =========================================================

function urlBase64ToArrayBuffer(
  base64String: string
): ArrayBuffer {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  const buffer =
    new ArrayBuffer(rawData.length);

  const bytes =
    new Uint8Array(buffer);

  for (
    let i = 0;
    i < rawData.length;
    i++
  ) {
    bytes[i] =
      rawData.charCodeAt(i);
  }

  return buffer;
}

// =========================================================
// SERVICE WORKER
// =========================================================

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    throw new Error(
      "Service Worker nije podržan u ovom browseru."
    );
  }

  const registration =
    await navigator.serviceWorker.register(
      "/sw.js"
    );

  await navigator.serviceWorker.ready;

  return registration;
}

// =========================================================
// GET EXISTING SUBSCRIPTION
// =========================================================

export async function getPushSubscription(): Promise<PushSubscription | null> {
  const registration =
    await registerServiceWorker();

  return registration.pushManager.getSubscription();
}

// =========================================================
// SUBSCRIBE TO WEB PUSH
// =========================================================

export async function subscribeToPush(): Promise<PushSubscription> {
  if (
    typeof window === "undefined" ||
    !("Notification" in window)
  ) {
    throw new Error(
      "Notifikacije nisu podržane u ovom browseru."
    );
  }

  if (
    !("serviceWorker" in navigator)
  ) {
    throw new Error(
      "Service Worker nije podržan u ovom browseru."
    );
  }

  if (
    !("PushManager" in window)
  ) {
    throw new Error(
      "Web Push nije podržan u ovom browseru."
    );
  }

  const publicKey =
    process.env
      .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY nije podešen."
    );
  }

  const permission =
    await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error(
      "Dozvola za notifikacije nije odobrena."
    );
  }

  const registration =
    await registerServiceWorker();

  let subscription =
    await registration.pushManager.getSubscription();

  // =======================================================
  // EXISTING SUBSCRIPTION
  // =======================================================

  if (subscription) {
    return subscription;
  }

  // =======================================================
  // CREATE NEW SUBSCRIPTION
  // =======================================================

  subscription =
    await registration.pushManager.subscribe({
      userVisibleOnly: true,

      applicationServerKey:
        urlBase64ToArrayBuffer(
          publicKey
        ),
    });

  return subscription;
}

// =========================================================
// SEND SUBSCRIPTION TO NEXT.JS
// =========================================================

export async function savePushSubscription(
  subscription: PushSubscription
) {
  const response =
    await fetch(
      "/api/push/subscribe",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          subscription,
        }),
      }
    );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.error ||
        "Čuvanje Web Push subscription-a nije uspelo."
    );
  }

  return data;
}

// =========================================================
// REMOVE SUBSCRIPTION FROM NEXT.JS
// =========================================================

export async function removePushSubscription(
  subscription: PushSubscription
) {
  const response =
    await fetch(
      "/api/push/unsubscribe",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          endpoint:
            subscription.endpoint,
        }),
      }
    );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.error ||
        "Uklanjanje Web Push subscription-a nije uspelo."
    );
  }

  return data;
}

// =========================================================
// UNSUBSCRIBE FROM WEB PUSH
// =========================================================

export async function unsubscribeFromPush(): Promise<boolean> {
  const registration =
    await registerServiceWorker();

  const subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    return false;
  }

  await removePushSubscription(
    subscription
  );

  const result =
    await subscription.unsubscribe();

  return result;
}

// =========================================================
// COMPLETE SUBSCRIBE FLOW
// =========================================================

export async function enablePushNotifications() {
  const subscription =
    await subscribeToPush();

  await savePushSubscription(
    subscription
  );

  return subscription;
}

// =========================================================
// COMPLETE UNSUBSCRIBE FLOW
// =========================================================

export async function disablePushNotifications() {
  return unsubscribeFromPush();
}

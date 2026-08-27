function urlBase64ToUint8Array(
  base64String: string
): Uint8Array {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Service Worker nije podržan."
    );
  }

  if (!("PushManager" in window)) {
    throw new Error(
      "Web Push nije podržan u ovom browseru."
    );
  }

  const permission =
    await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error(
      "Korisnik nije dozvolio notifikacije."
    );
  }

  const registration =
    await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    const response = await fetch(
      "/api/push/vapid-public-key"
    );

    if (!response.ok) {
      throw new Error(
        "Nije moguće dobiti VAPID public key."
      );
    }

    const { publicKey } =
      await response.json();

    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(publicKey),
      });
  }

  const saveResponse = await fetch(
    "/api/push/subscribe",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    }
  );

  if (!saveResponse.ok) {
    throw new Error(
      "Nije moguće sačuvati push subscription."
    );
  }

  return subscription;
}

// src/lib/push/register.ts

export async function registerPush() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker nije podržan");
    return null;
  }

  try {
    // 1. Registracija service workera
    const registration = await navigator.serviceWorker.register("/sw.js");

    // 2. Tražimo permission za notifikacije
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notifikacije nisu dozvoljene");
      return null;
    }

    // 3. Push subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_KEY!
      ),
    });

    // 4. Šalješ subscription na backend
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (err) {
    console.error("Push registration error:", err);
    return null;
  }
}

// helper za VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

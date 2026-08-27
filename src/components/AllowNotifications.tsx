"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

export default function AllowNotifications() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function enableNotifications() {
    try {
      setLoading(true);
      setMessage("");

      // Provera podrške
      if (!("Notification" in window)) {
        throw new Error(
          "Ovaj browser ne podržava notifikacije."
        );
      }

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

      // Dozvola za notifikacije
      let permission = Notification.permission;

      if (permission !== "granted") {
        permission =
          await Notification.requestPermission();
      }

      if (permission !== "granted") {
        throw new Error(
          "Dozvola za notifikacije nije odobrena."
        );
      }

      // Service Worker
      const registration =
        await navigator.serviceWorker.register(
          "/sw.js"
        );

      await navigator.serviceWorker.ready;

      // VAPID public key
      const vapidResponse = await fetch(
        "/api/push/vapid-public-key",
        {
          cache: "no-store",
        }
      );

      if (!vapidResponse.ok) {
        throw new Error(
          "Nije moguće dobiti VAPID public key."
        );
      }

      const { publicKey } =
        await vapidResponse.json();

      if (!publicKey) {
        throw new Error(
          "VAPID public key nije pronađen."
        );
      }

      // Postojeća subscription
      let subscription =
        await registration.pushManager.getSubscription();

      // Nova subscription
      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(publicKey),
          });
      }

      // Čuvanje subscription-a na serveru
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

      const saveData =
        await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData?.error ||
            "Subscription nije sačuvan."
        );
      }

      setMessage(
        "Notifikacije su uspešno uključene."
      );
    } catch (error) {
      console.error("Web Push error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Greška prilikom uključivanja notifikacija."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        className="w-fit rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Uključivanje..."
          : "Dozvoli notifikacije"}
      </button>

      {message && (
        <p className="text-sm text-slate-600">
          {message}
        </p>
      )}
    </div>
  );
}

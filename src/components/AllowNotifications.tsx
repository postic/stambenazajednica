"use client";

import { useState } from "react";

export default function AllowNotifications() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");

  async function enableNotifications() {
    try {
      setLoading(true);
      setMessage("");

      if (!("Notification" in window)) {
        setMessage("Ovaj browser ne podržava obaveštenja.");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setMessage("Service Worker nije podržan.");
        return;
      }

      if (!("PushManager" in window)) {
        setMessage("Web Push nije podržan.");
        return;
      }

      let permission = Notification.permission;

      if (permission === "default") {
        permission =
          await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setMessage("Obaveštenja nisu dozvoljena.");
        return;
      }

      const registration =
        await navigator.serviceWorker.ready;

      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error(
          "NEXT_PUBLIC_VAPID_PUBLIC_KEY nije podešen."
        );
      }

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(
                vapidPublicKey
              ),
          });
      }

      const response = await fetch(
        "/api/push/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            subscription.toJSON()
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Greška prilikom čuvanja subscription-a."
        );
      }

      setMessage(
        "Obaveštenja su uspešno uključena."
      );
    } catch (error) {
      console.error(
        "Web Push error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Greška prilikom uključivanja obaveštenja."
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendTestNotification() {
    try {
      setTesting(true);
      setMessage("");

      const registration =
        await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        setMessage(
          "Prvo uključi obaveštenja."
        );
        return;
      }

      const response = await fetch(
        "/api/push/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            subscription:
              subscription.toJSON(),

            title: "Test obaveštenje",

            body:
              "Web Push radi uspešno! 🎉",

            url: "/moja-obavestenja",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Slanje test obaveštenja nije uspelo."
        );
      }

      setMessage(
        "Test obaveštenje je poslato."
      );
    } catch (error) {
      console.error(
        "Push test error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Greška prilikom slanja testa."
      );
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Uključivanje..."
          : "Dozvoli obaveštenja"}
      </button>

      <button
        type="button"
        onClick={sendTestNotification}
        disabled={testing}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
      >
        {testing
          ? "Slanje..."
          : "Pošalji test obaveštenje"}
      </button>

      {message && (
        <p className="text-sm text-slate-600">
          {message}
        </p>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(
  base64String: string
): Uint8Array {
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

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  );
}

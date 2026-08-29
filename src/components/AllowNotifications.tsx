"use client";

import { useEffect, useState } from "react";

// =========================================================
// BASE64 VAPID KEY → ARRAYBUFFER
// =========================================================

function urlBase64ToArrayBuffer(
  base64String: string
): ArrayBuffer {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const buffer = new ArrayBuffer(rawData.length);
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }

  return buffer;
}

// =========================================================
// TYPES
// =========================================================

interface SaveResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

interface PushKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: PushKeys;
}

// =========================================================
// COMPONENT
// =========================================================

export default function AllowNotifications() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // =======================================================
  // CHECK EXISTING SUBSCRIPTION
  // =======================================================

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      if (typeof window === "undefined") {
        return;
      }

      if (!("serviceWorker" in navigator)) {
        console.log(
          "❌ Service Worker nije podržan"
        );

        return;
      }

      if (!("PushManager" in window)) {
        console.log(
          "❌ PushManager nije podržan"
        );

        return;
      }

      const registration =
        await navigator.serviceWorker.register(
          "/sw.js"
        );

      await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager.getSubscription();

      setEnabled(Boolean(subscription));
    } catch (error) {
      console.error(
        "❌ Greška pri proveri subscription:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =======================================================
  // ENABLE NOTIFICATIONS
  // =======================================================

  async function enableNotifications() {
    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      // ===================================================
      // 1. PROVERA PODRŠKE
      // ===================================================

      if (typeof window === "undefined") {
        throw new Error(
          "Browser okruženje nije dostupno."
        );
      }

      if (!("Notification" in window)) {
        throw new Error(
          "Ovaj browser ne podržava notifikacije."
        );
      }

      if (!("serviceWorker" in navigator)) {
        throw new Error(
          "Service Worker nije podržan u ovom browseru."
        );
      }

      if (!("PushManager" in window)) {
        throw new Error(
          "Web Push nije podržan u ovom browseru."
        );
      }

      // ===================================================
      // 2. DOZVOLA
      // ===================================================

      let permission =
        Notification.permission;

      if (permission !== "granted") {
        permission =
          await Notification.requestPermission();
      }

      if (permission !== "granted") {
        throw new Error(
          "Dozvola za notifikacije nije odobrena."
        );
      }

      // ===================================================
      // 3. SERVICE WORKER
      // ===================================================

      const registration =
        await navigator.serviceWorker.register(
          "/sw.js"
        );

      await navigator.serviceWorker.ready;

      // ===================================================
      // 4. VAPID PUBLIC KEY
      // ===================================================

      const vapidResponse =
        await fetch(
          "/api/push/vapid-public-key",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      if (!vapidResponse.ok) {
        throw new Error(
          "Nije moguće dobiti VAPID public key."
        );
      }

      const vapidData =
        await vapidResponse.json();

      const publicKey =
        vapidData?.publicKey;

      if (!publicKey) {
        throw new Error(
          "VAPID public key nije pronađen."
        );
      }

      // ===================================================
      // 5. POSTOJEĆI SUBSCRIPTION
      // ===================================================

      let subscription =
        await registration.pushManager.getSubscription();

      // ===================================================
      // 6. NOVA SUBSCRIPTION
      // ===================================================

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,

            applicationServerKey:
              urlBase64ToArrayBuffer(
                publicKey
              ),
          });
      }

      // ===================================================
      // 7. PROVERA
      // ===================================================

      if (!subscription) {
        throw new Error(
          "Web Push subscription nije kreiran."
        );
      }

      // ===================================================
      // 8. SLANJE NEXT.JS API-JU
      // ===================================================

      const saveResponse =
        await fetch(
          "/api/push/subscribe",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              subscription:
                subscription.toJSON(),
            }),
          }
        );

      const responseText =
        await saveResponse.text();

      let saveData:
        | SaveResponse
        | null = null;

      try {
        saveData =
          responseText
            ? JSON.parse(responseText)
            : null;
      } catch {
        saveData = {
          error: responseText,
        };
      }

      if (!saveResponse.ok) {
        throw new Error(
          saveData?.error ||
            "Subscription nije sačuvan."
        );
      }

      // ===================================================
      // 9. SUCCESS
      // ===================================================

      setEnabled(true);
      setSuccess(true);

      setMessage(
        saveData?.message ||
          "Notifikacije su uspešno uključene."
      );
    } catch (error) {
      console.error(
        "❌ Web Push error:",
        error
      );

      setEnabled(false);
      setSuccess(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Greška prilikom uključivanja notifikacija."
      );
    } finally {
      setLoading(false);
    }
  }

  // =======================================================
  // DISABLE NOTIFICATIONS
  // =======================================================

  async function disableNotifications() {
    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      // ===================================================
      // 1. SERVICE WORKER
      // ===================================================

      if (!("serviceWorker" in navigator)) {
        throw new Error(
          "Service Worker nije podržan."
        );
      }

      const registration =
        await navigator.serviceWorker.ready;

      // ===================================================
      // 2. POSTOJEĆI SUBSCRIPTION
      // ===================================================

      const subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        setEnabled(false);
        setSuccess(true);

        setMessage(
          "Notifikacije su već isključene."
        );

        return;
      }

      // ===================================================
      // 3. BRISANJE SA NEXT.JS / DRUPAL
      // ===================================================

      const response =
        await fetch(
          "/api/push/unsubscribe",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              endpoint:
                subscription.endpoint,
            }),
          }
        );

      const responseText =
        await response.text();

      let data:
        | SaveResponse
        | null = null;

      try {
        data =
          responseText
            ? JSON.parse(responseText)
            : null;
      } catch {
        data = {
          error: responseText,
        };
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Subscription nije obrisan sa servera."
        );
      }

      // ===================================================
      // 4. BRISANJE IZ BROWSERA
      // ===================================================

      const unsubscribed =
        await subscription.unsubscribe();

      if (!unsubscribed) {
        throw new Error(
          "Subscription nije uklonjen iz browsera."
        );
      }

      // ===================================================
      // 5. SUCCESS
      // ===================================================

      setEnabled(false);
      setSuccess(true);

      setMessage(
        data?.message ||
          "Notifikacije su uspešno isključene."
      );
    } catch (error) {
      console.error(
        "❌ Disable notifications error:",
        error
      );

      setEnabled(true);
      setSuccess(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Greška prilikom isključivanja notifikacija."
      );
    } finally {
      setLoading(false);
    }
  }

  // =======================================================
  // SWITCH CHANGE
  // =======================================================

  async function handleSwitchChange(
    checked: boolean
  ) {
    if (loading) {
      return;
    }

    if (checked) {
      await enableNotifications();
    } else {
      await disableNotifications();
    }
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-6">
        {/* TEXT */}

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900">
            Push notifikacije
          </h3>

          <p className="text-sm text-gray-500">
            {enabled
              ? "Notifikacije su uključene."
              : "Notifikacije su isključene."}
          </p>
        </div>

        {/* APPLE STYLE SWITCH */}

        <label
          className={`
            relative
            inline-flex
            h-8
            w-16
            shrink-0
            items-center
            rounded-full
            border
            p-px
            transition-colors
            duration-200
            ${
              enabled
                ? "border-green-500"
                : "border-red-500"
            }
            ${
              loading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }
          `}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={enabled}
            disabled={loading}
            onChange={(event) =>
              handleSwitchChange(
                event.target.checked
              )
            }
          />

          {/* SWITCH BUTTON */}

          <span
            className={`
              absolute
              top-1/2
              h-7
              w-7
              -translate-y-1/2
              rounded-full
              shadow-sm
              transition-all
              duration-200
              ease-in-out
              ${
                enabled
                  ? "left-[calc(100%-29px)] bg-green-500"
                  : "left-px bg-red-500"
              }
            `}
          />
        </label>
      </div>

      {/* STATUS MESSAGE */}

      {message && (
        <p
          className={
            success
              ? "text-sm text-green-600"
              : "text-sm text-red-600"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}

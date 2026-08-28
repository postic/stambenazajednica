"use client";

import { useState } from "react";

// =========================================================
// BASE64 VAPID KEY → ARRAYBUFFER
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
// COMPONENT
// =========================================================

export default function AllowNotifications() {
  console.log(
    "🔥 AllowNotifications RENDER"
  );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  // =======================================================
  // ENABLE NOTIFICATIONS
  // =======================================================

  async function enableNotifications() {
    console.log(
      "🔥 enableNotifications POZVAN"
    );

    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      // ===================================================
      // 1. PROVERA PODRŠKE
      // ===================================================

      console.log(
        "🔥 1. Provera browser podrške"
      );

      if (
        typeof window === "undefined"
      ) {
        throw new Error(
          "Browser okruženje nije dostupno."
        );
      }

      if (
        !("Notification" in window)
      ) {
        throw new Error(
          "Ovaj browser ne podržava notifikacije."
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

      console.log(
        "🔥 Browser podržava Web Push"
      );

      // ===================================================
      // 2. DOZVOLA
      // ===================================================

      console.log(
        "🔥 2. Notification permission:",
        Notification.permission
      );

      let permission =
        Notification.permission;

      if (
        permission !== "granted"
      ) {
        console.log(
          "🔥 Tražim dozvolu..."
        );

        permission =
          await Notification.requestPermission();

        console.log(
          "🔥 Rezultat dozvole:",
          permission
        );
      }

      if (
        permission !== "granted"
      ) {
        throw new Error(
          "Dozvola za notifikacije nije odobrena."
        );
      }

      console.log(
        "🔥 Notification dozvola OK"
      );

      // ===================================================
      // 3. SERVICE WORKER
      // ===================================================

      console.log(
        "🔥 3. Registrujem /sw.js"
      );

      const registration =
        await navigator.serviceWorker.register(
          "/sw.js"
        );

      console.log(
        "🔥 Service Worker registration:",
        registration
      );

      await navigator.serviceWorker.ready;

      console.log(
        "🔥 Service Worker READY"
      );

      // ===================================================
      // 4. VAPID PUBLIC KEY
      // ===================================================

      console.log(
        "🔥 4. Uzimam VAPID public key"
      );

      const vapidResponse =
        await fetch(
          "/api/push/vapid-public-key",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      console.log(
        "🔥 VAPID response:",
        vapidResponse.status
      );

      if (
        !vapidResponse.ok
      ) {
        throw new Error(
          "Nije moguće dobiti VAPID public key."
        );
      }

      const vapidData =
        await vapidResponse.json();

      const publicKey =
        vapidData?.publicKey;

      console.log(
        "🔥 VAPID public key postoji:",
        Boolean(publicKey)
      );

      if (!publicKey) {
        throw new Error(
          "VAPID public key nije pronađen."
        );
      }

      // ===================================================
      // 5. POSTOJEĆA SUBSCRIPTION
      // ===================================================

      console.log(
        "🔥 5. Proveravam postojeći subscription"
      );

      let subscription =
        await registration.pushManager.getSubscription();

      console.log(
        "🔥 Postojeći subscription:",
        subscription
      );

      // ===================================================
      // 6. NOVA SUBSCRIPTION
      // ===================================================

      if (!subscription) {
        console.log(
          "🔥 6. Kreiram NOVI subscription"
        );

        subscription =
          await registration.pushManager.subscribe(
            {
              userVisibleOnly: true,

              applicationServerKey:
                urlBase64ToArrayBuffer(
                  publicKey
                ),
            }
          );

        console.log(
          "🔥 NOVI subscription kreiran:",
          subscription
        );
      } else {
        console.log(
          "🔥 Subscription već postoji"
        );
      }

      // ===================================================
      // 7. PROVERA
      // ===================================================

      if (!subscription) {
        throw new Error(
          "Web Push subscription nije kreiran."
        );
      }

      console.log(
        "🔥 Subscription JSON:",
        subscription.toJSON()
      );

      // ===================================================
      // 8. SLANJE NEXT.JS API-ju
      // ===================================================

      console.log(
        "🔥 8. Šaljem subscription na /api/push/subscribe"
      );

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

      console.log(
        "🔥 Next.js response status:",
        saveResponse.status
      );

      const responseText =
        await saveResponse.text();

      console.log(
        "🔥 Next.js response:",
        responseText
      );

      let saveData:
        | {
            success?: boolean;
            error?: string;
            message?: string;
          }
        | null = null;

      try {
        saveData =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;
      } catch {
        saveData = {
          error:
            responseText,
        };
      }

      if (
        !saveResponse.ok
      ) {
        throw new Error(
          saveData?.error ||
            "Subscription nije sačuvan."
        );
      }

      // ===================================================
      // 9. SUCCESS
      // ===================================================

      console.log(
        "🎉 WEB PUSH JE USPEŠNO UKLJUČEN"
      );

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

      setSuccess(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Greška prilikom uključivanja notifikacija."
      );
    } finally {
      setLoading(false);

      console.log(
        "🔥 Web Push proces završen"
      );
    }
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          console.log(
            "🔥🔥 BUTTON CLICK RADI"
          );

          enableNotifications();
        }}
        disabled={loading}
        className="w-fit rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Uključivanje..."
          : "Dozvoli notifikacije"}
      </button>

      {message && (
        <p
          className={
            success
              ? "text-sm text-green-600"
              : "text-sm text-slate-600"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}

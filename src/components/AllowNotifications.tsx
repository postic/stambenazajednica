"use client";

import { useEffect, useState } from "react";

/**
 * =========================================================
 * BASE64URL → ARRAY BUFFER
 * =========================================================
 */
function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const base64 = base64String
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

interface SaveResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

interface PushStatusResponse {
  success?: boolean;
  subscribed?: boolean;
  subscription?: boolean;
  error?: string;
}

/**
 * =========================================================
 * WAIT FOR SERVICE WORKER
 * =========================================================
 */

async function waitForServiceWorker(
  registration: ServiceWorkerRegistration
): Promise<ServiceWorkerRegistration> {
  if (registration.active) {
    return registration;
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          "Service Worker nije postao aktivan u očekivanom vremenu."
        )
      );
    }, 15000);

    const check = () => {
      if (registration.active) {
        clearTimeout(timeout);
        resolve(registration);
        return;
      }

      setTimeout(check, 100);
    };

    check();
  });
}

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function AllowNotifications() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [checking, setChecking] = useState(true);

  /**
   * =======================================================
   * PROVERA TRENUTNOG STATUSA
   * =======================================================
   */

  const checkSubscription = async () => {
    try {
      setChecking(true);

      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setEnabled(false);
        return;
      }

      const registration =
        await navigator.serviceWorker.getRegistration("/");

      if (!registration) {
        setEnabled(false);
        return;
      }

      if (!registration.active) {
        setEnabled(false);
        return;
      }

      /**
       * Browser subscription
       */
      const subscription =
        await registration.pushManager.getSubscription();

      const browserSubscribed = !!subscription;

      /**
       * Database subscription
       */
      let databaseSubscribed = false;

      try {
        const response = await fetch("/api/push/status", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (response.ok) {
          const data: PushStatusResponse =
            await response.json();

          databaseSubscribed =
            data.subscribed === true ||
            data.subscription === true;
        }
      } catch (error) {
        console.warn(
          "Nije moguće proveriti status push subscription-a:",
          error
        );
      }

      /**
       * Push je aktivan samo ako postoji
       * i u browseru i u bazi.
       */
      setEnabled(
        browserSubscribed && databaseSubscribed
      );

      if (
        databaseSubscribed &&
        !browserSubscribed
      ) {
        console.warn(
          "Baza ima push subscription, ali browser nema aktivnu subscription."
        );
      }
    } catch (error) {
      console.error(
        "Greška prilikom provere push subscription-a:",
        error
      );

      setEnabled(false);
    } finally {
      setChecking(false);
    }
  };

  /**
   * =======================================================
   * INITIAL CHECK
   * =======================================================
   */

  useEffect(() => {
    checkSubscription();
  }, []);

  /**
   * =======================================================
   * ENABLE NOTIFICATIONS
   * =======================================================
   */

  const enableNotifications = async () => {
    try {
      setLoading(true);

      /**
       * Notification API
       */
      if (!("Notification" in window)) {
        throw new Error(
          "Ovaj browser ne podržava notifikacije."
        );
      }

      /**
       * Service Worker
       */
      if (!("serviceWorker" in navigator)) {
        throw new Error(
          "Ovaj browser ne podržava Service Worker."
        );
      }

      /**
       * Push API
       */
      if (!("PushManager" in window)) {
        throw new Error(
          "Ovaj browser ne podržava Push API."
        );
      }

      /**
       * ===================================================
       * SERVICE WORKER
       * ===================================================
       */

      let registration =
        await navigator.serviceWorker.getRegistration("/");

      if (!registration) {
        registration =
          await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
            }
          );
      }

      /**
       * Čekamo da Service Worker bude aktivan.
       */
      registration =
        await waitForServiceWorker(registration);

      /**
       * ===================================================
       * NOTIFICATION PERMISSION
       * ===================================================
       */

      let permission = Notification.permission;

      if (permission === "default") {
        permission =
          await Notification.requestPermission();
      }

      if (permission !== "granted") {
        throw new Error(
          "Dozvola za notifikacije nije odobrena."
        );
      }

      /**
       * ===================================================
       * VAPID PUBLIC KEY
       * ===================================================
       */

      const vapidResponse = await fetch(
        "/api/push/vapid-public-key",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!vapidResponse.ok) {
        throw new Error(
          "Nije moguće dobiti VAPID public key."
        );
      }

      const vapidData = await vapidResponse.json();

      const publicKey =
        vapidData.publicKey ||
        vapidData.vapidPublicKey;

      if (!publicKey) {
        throw new Error(
          "VAPID public key nedostaje."
        );
      }

      /**
       * ===================================================
       * BROWSER PUSH SUBSCRIPTION
       * ===================================================
       */

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToArrayBuffer(publicKey),
          });
      }

      /**
       * ===================================================
       * SAVE SUBSCRIPTION
       * ===================================================
       */

      const saveResponse = await fetch(
        "/api/push/subscribe",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            subscription.toJSON()
          ),
        }
      );

      const saveData: SaveResponse =
        await saveResponse.json();

      if (
        !saveResponse.ok ||
        saveData.success === false
      ) {
        throw new Error(
          saveData.error ||
            saveData.message ||
            "Subscription nije sačuvan."
        );
      }

      /**
       * ===================================================
       * VERIFY
       * ===================================================
       */

      const statusResponse = await fetch(
        "/api/push/status",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (statusResponse.ok) {
        const statusData: PushStatusResponse =
          await statusResponse.json();

        if (statusData.subscribed !== true) {
          throw new Error(
            "Subscription je sačuvan, ali status nije potvrđen."
          );
        }
      }

      setEnabled(true);
    } catch (error) {
      console.error(
        "Greška prilikom uključivanja notifikacija:",
        error
      );

      await checkSubscription();
    } finally {
      setLoading(false);
    }
  };

  /**
   * =======================================================
   * DISABLE NOTIFICATIONS
   * =======================================================
   */

  const disableNotifications = async () => {
    try {
      setLoading(true);

      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setEnabled(false);
        return;
      }

      /**
       * Dohvati Service Worker
       */
      const registration =
        await navigator.serviceWorker.getRegistration(
          "/"
        );

      if (!registration) {
        setEnabled(false);
        return;
      }

      /**
       * Dohvati browser subscription
       */
      const subscription =
        await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint =
          subscription.endpoint;

        /**
         * Obriši subscription iz baze
         */
        const response = await fetch(
          "/api/push/unsubscribe",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              endpoint,
            }),
          }
        );

        if (!response.ok) {
          console.warn(
            "Unsubscribe API nije uspeo."
          );
        }

        /**
         * Obriši browser subscription
         */
        await subscription.unsubscribe();
      }

      /**
       * Proveri stanje
       */
      await checkSubscription();

      setEnabled(false);
    } catch (error) {
      console.error(
        "Greška prilikom isključivanja notifikacija:",
        error
      );

      await checkSubscription();
    } finally {
      setLoading(false);
    }
  };

  /**
   * =======================================================
   * SWITCH CLICK
   * =======================================================
   */

  const handleSwitchClick = async () => {
    if (loading || checking) {
      return;
    }

    if (enabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  /**
   * =======================================================
   * UI
   *
   * SWITCH LEVO
   * STATUS DESNO
   * =======================================================
   */

  return (
    <div className="flex items-center gap-3">

      {/* SWITCH */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Push obaveštenja"
        aria-busy={loading}
        onClick={handleSwitchClick}
        disabled={loading || checking}
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
          transition-all
          duration-200

          ${
            enabled
              ? "border-green-500"
              : "border-red-500"
          }

          ${
            loading || checking
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer opacity-100"
          }
        `}
      >
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
      </button>

      {/* STATUS */}
      <span className="text-sm text-gray-500">
        {checking
          ? "Provera..."
          : enabled
          ? "Notifikacije su uključene"
          : "Notifikacije su isključene"}
      </span>

    </div>
  );
}

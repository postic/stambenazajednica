"use client";

import { useEffect, useState } from "react";

/**
 * =========================================================
 * BASE64URL → ARRAY BUFFER
 * =========================================================
 */

function urlBase64ToArrayBuffer(
  base64String: string
): ArrayBuffer {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 = (
    base64String
      .replace(/-/g, "+")
      .replace(/_/g, "/") + padding
  );

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(
    rawData.length
  );

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] =
      rawData.charCodeAt(i);
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

/**
 * =========================================================
 * SERVICE WORKER
 * =========================================================
 *
 * Čeka da Service Worker postane ACTIVE.
 *
 * Ako worker postane "redundant", odmah prijavljujemo
 * grešku umesto da čekamo 15 sekundi.
 */

async function getActiveServiceWorker(): Promise<
  ServiceWorkerRegistration
> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    throw new Error(
      "Service Worker nije podržan u ovom browseru."
    );
  }

  /**
   * -------------------------------------------------------
   * POSTOJEĆA REGISTRACIJA
   * -------------------------------------------------------
   */

  let registration =
    await navigator.serviceWorker.getRegistration(
      "/"
    );

  /**
   * -------------------------------------------------------
   * AKO NE POSTOJI → REGISTRUJ /sw.js
   * -------------------------------------------------------
   */

  if (!registration) {
    console.log(
      "[Push] Registrujem Service Worker /sw.js..."
    );

    registration =
      await navigator.serviceWorker.register(
        "/sw.js",
        {
          scope: "/",
        }
      );

    console.log(
      "[Push] Service Worker registrovan:",
      registration
    );
  }

  /**
   * -------------------------------------------------------
   * AKO JE VEĆ ACTIVE
   * -------------------------------------------------------
   */

  if (registration.active) {
    console.log(
      "[Push] Service Worker je već ACTIVE."
    );

    return registration;
  }

  /**
   * -------------------------------------------------------
   * ČEKANJE NA ACTIVE
   * -------------------------------------------------------
   */

  console.log(
    "[Push] Čekam da Service Worker postane ACTIVE..."
  );

  return new Promise(
    (resolve, reject) => {
      let finished = false;

      const timeout = window.setTimeout(
        () => {
          if (finished) {
            return;
          }

          finished = true;

          reject(
            new Error(
              "Service Worker nije postao aktivan u očekivanom vremenu."
            )
          );
        },
        15000
      );

      /**
       * ---------------------------------------------------
       * PROVERA STATE
       * ---------------------------------------------------
       */

      const checkState = () => {
        if (finished) {
          return;
        }

        /**
         * ACTIVE
         */

        if (registration.active) {
          finished = true;

          window.clearTimeout(
            timeout
          );

          console.log(
            "[Push] Service Worker je ACTIVE."
          );

          resolve(registration);

          return;
        }

        /**
         * INSTALLING
         */

        if (
          registration.installing
        ) {
          console.log(
            "[Push] Service Worker state:",
            registration.installing.state
          );
        }

        /**
         * WAITING
         */

        if (
          registration.waiting
        ) {
          console.log(
            "[Push] Service Worker je WAITING."
          );
        }
      };

      /**
       * ---------------------------------------------------
       * STATE CHANGE
       * ---------------------------------------------------
       */

      const worker =
        registration.installing ||
        registration.waiting;

      if (worker) {
        worker.addEventListener(
          "statechange",
          () => {
            console.log(
              "[Push] Service Worker state:",
              worker.state
            );

            /**
             * ACTIVE
             */

            if (
              worker.state ===
              "activated"
            ) {
              checkState();
              return;
            }

            /**
             * REDUNDANT
             */

            if (
              worker.state ===
              "redundant"
            ) {
              if (finished) {
                return;
              }

              finished = true;

              window.clearTimeout(
                timeout
              );

              reject(
                new Error(
                  "Service Worker je postao redundant. Proveri /sw.js i Firefox Service Worker grešku u DevTools."
                )
              );
            }
          }
        );
      }

      /**
       * ---------------------------------------------------
       * FALLBACK POLLING
       * ---------------------------------------------------
       */

      const interval =
        window.setInterval(() => {
          if (finished) {
            window.clearInterval(
              interval
            );

            return;
          }

          checkState();

          if (
            registration.active
          ) {
            window.clearInterval(
              interval
            );
          }
        }, 100);

      /**
       * Prva provera odmah
       */

      checkState();
    }
  );
}

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function AllowNotifications() {
  const [loading, setLoading] =
    useState(false);

  const [enabled, setEnabled] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<
      "success" | "error" | "info"
    >("info");

  /**
   * =======================================================
   * MESSAGE
   * =======================================================
   */

  const showMessage = (
    text: string,
    type:
      | "success"
      | "error"
      | "info"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  /**
   * =======================================================
   * PROVERA TRENUTNOG STATUSA
   * =======================================================
   *
   * ON/OFF stanje određuje browser PushSubscription.
   *
   * NE proveravamo Drupal bazu.
   */

  const checkSubscription =
    async () => {
      try {
        setChecking(true);

        /**
         * ---------------------------------------------------
         * BROWSER SUPPORT
         * ---------------------------------------------------
         */

        if (
          typeof window ===
            "undefined" ||
          !(
            "serviceWorker" in
            navigator
          ) ||
          !("PushManager" in window)
        ) {
          setEnabled(false);
          return;
        }

        /**
         * ---------------------------------------------------
         * SERVICE WORKER
         * ---------------------------------------------------
         */

        const registration =
          await navigator.serviceWorker.getRegistration(
            "/"
          );

        if (!registration) {
          console.log(
            "[Push] Nema Service Worker registracije."
          );

          setEnabled(false);
          return;
        }

        /**
         * ---------------------------------------------------
         * PUSH SUBSCRIPTION
         * ---------------------------------------------------
         */

        const subscription =
          await registration.pushManager.getSubscription();

        const browserSubscribed =
          !!subscription;

        console.log(
          "[Push] Browser subscription:",
          browserSubscribed
        );

        /**
         * Browser subscription je source of truth
         */

        setEnabled(
          browserSubscribed
        );
      } catch (error) {
        console.error(
          "[Push] Greška prilikom provere:",
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

  const enableNotifications =
    async () => {
      try {
        setLoading(true);

        setMessage("");

        /**
         * ---------------------------------------------------
         * NOTIFICATION SUPPORT
         * ---------------------------------------------------
         */

        if (
          !("Notification" in window)
        ) {
          throw new Error(
            "Ovaj browser ne podržava notifikacije."
          );
        }

        /**
         * ---------------------------------------------------
         * SERVICE WORKER SUPPORT
         * ---------------------------------------------------
         */

        if (
          !(
            "serviceWorker" in
            navigator
          )
        ) {
          throw new Error(
            "Ovaj browser ne podržava Service Worker."
          );
        }

        /**
         * ---------------------------------------------------
         * PUSH SUPPORT
         * ---------------------------------------------------
         */

        if (
          !("PushManager" in window)
        ) {
          throw new Error(
            "Ovaj browser ne podržava Push API."
          );
        }

        /**
         * ---------------------------------------------------
         * SERVICE WORKER
         * ---------------------------------------------------
         */

        const registration =
          await getActiveServiceWorker();

        console.log(
          "[Push] Active registration:",
          registration
        );

        /**
         * ---------------------------------------------------
         * NOTIFICATION PERMISSION
         * ---------------------------------------------------
         */

        let permission =
          Notification.permission;

        console.log(
          "[Push] Notification.permission:",
          permission
        );

        if (
          permission ===
          "default"
        ) {
          permission =
            await Notification.requestPermission();

          console.log(
            "[Push] Nova permission vrednost:",
            permission
          );
        }

        if (
          permission !==
          "granted"
        ) {
          throw new Error(
            "Dozvola za notifikacije nije odobrena."
          );
        }

        /**
         * ---------------------------------------------------
         * VAPID PUBLIC KEY
         * ---------------------------------------------------
         */

        const vapidResponse =
          await fetch(
            "/api/push/vapid-public-key",
            {
              method: "GET",
              credentials:
                "include",
              cache: "no-store",
            }
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
          vapidData.publicKey ||
          vapidData.vapidPublicKey;

        if (!publicKey) {
          throw new Error(
            "VAPID public key nedostaje."
          );
        }

        console.log(
          "[Push] VAPID public key dobijen."
        );

        /**
         * ---------------------------------------------------
         * POSTOJEĆA SUBSCRIPTION
         * ---------------------------------------------------
         */

        let subscription =
          await registration.pushManager.getSubscription();

        /**
         * ---------------------------------------------------
         * NOVA SUBSCRIPTION
         * ---------------------------------------------------
         */

        if (!subscription) {
          console.log(
            "[Push] Kreiram novu PushSubscription..."
          );

          subscription =
            await registration.pushManager.subscribe(
              {
                userVisibleOnly:
                  true,

                applicationServerKey:
                  urlBase64ToArrayBuffer(
                    publicKey
                  ),
              }
            );

          console.log(
            "[Push] PushSubscription kreirana."
          );
        } else {
          console.log(
            "[Push] Postojeća PushSubscription pronađena."
          );
        }

        /**
         * ---------------------------------------------------
         * SAVE TO NEXT.JS API
         * ---------------------------------------------------
         */

        const saveResponse =
          await fetch(
            "/api/push/subscribe",
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                subscription.toJSON()
              ),
            }
          );

        let saveData:
          SaveResponse = {};

        try {
          saveData =
            await saveResponse.json();
        } catch {
          // API nije vratio JSON
        }

        /**
         * ---------------------------------------------------
         * SAVE ERROR
         * ---------------------------------------------------
         */

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
         * ---------------------------------------------------
         * SUCCESS
         * ---------------------------------------------------
         */

        setEnabled(true);

        showMessage(
          saveData.message ||
            "Notifikacije su uspešno uključene.",
          "success"
        );

        console.log(
          "[Push] Notifikacije uključene."
        );
      } catch (error) {
        console.error(
          "[Push] Greška prilikom uključivanja:",
          error
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Došlo je do greške prilikom uključivanja notifikacija.";

        showMessage(
          errorMessage,
          "error"
        );

        /**
         * Ponovna provera
         */

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

  const disableNotifications =
    async () => {
      try {
        setLoading(true);

        setMessage("");

        /**
         * ---------------------------------------------------
         * SUPPORT
         * ---------------------------------------------------
         */

        if (
          !(
            "serviceWorker" in
            navigator
          ) ||
          !("PushManager" in window)
        ) {
          setEnabled(false);
          return;
        }

        /**
         * ---------------------------------------------------
         * REGISTRATION
         * ---------------------------------------------------
         */

        const registration =
          await navigator.serviceWorker.getRegistration(
            "/"
          );

        if (!registration) {
          setEnabled(false);

          showMessage(
            "Notifikacije su isključene.",
            "success"
          );

          return;
        }

        /**
         * ---------------------------------------------------
         * SUBSCRIPTION
         * ---------------------------------------------------
         */

        const subscription =
          await registration.pushManager.getSubscription();

        if (!subscription) {
          setEnabled(false);

          showMessage(
            "Notifikacije su isključene.",
            "success"
          );

          return;
        }

        /**
         * ---------------------------------------------------
         * ENDPOINT
         * ---------------------------------------------------
         */

        const endpoint =
          subscription.endpoint;

        console.log(
          "[Push] Unsubscribe endpoint:",
          endpoint
        );

        /**
         * ---------------------------------------------------
         * REMOVE FROM SERVER
         * ---------------------------------------------------
         */

        try {
          const response =
            await fetch(
              "/api/push/unsubscribe",
              {
                method: "POST",

                credentials:
                  "include",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  endpoint,
                }),
              }
            );

          if (!response.ok) {
            console.warn(
              "[Push] Unsubscribe API nije uspeo:",
              response.status
            );
          }
        } catch (error) {
          console.warn(
            "[Push] Greška prilikom server unsubscribe:",
            error
          );
        }

        /**
         * ---------------------------------------------------
         * REMOVE BROWSER SUBSCRIPTION
         * ---------------------------------------------------
         */

        const unsubscribed =
          await subscription.unsubscribe();

        console.log(
          "[Push] Browser unsubscribe:",
          unsubscribed
        );

        /**
         * ---------------------------------------------------
         * UPDATE UI
         * ---------------------------------------------------
         */

        setEnabled(false);

        showMessage(
          "Notifikacije su isključene.",
          "success"
        );
      } catch (error) {
        console.error(
          "[Push] Greška prilikom isključivanja:",
          error
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Došlo je do greške prilikom isključivanja notifikacija.";

        showMessage(
          errorMessage,
          "error"
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

  const handleSwitchClick =
    async () => {
      if (
        loading ||
        checking
      ) {
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
   * =======================================================
   */

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Push obaveštenja"
          aria-busy={loading}
          onClick={
            handleSwitchClick
          }
          disabled={
            loading ||
            checking
          }
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
              loading ||
              checking
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

        <span className="text-sm text-gray-500">
          {checking
            ? "Provera..."
            : enabled
            ? "Notifikacije su uključene"
            : "Notifikacije su isključene"}
        </span>
      </div>
    </div>
  );
}

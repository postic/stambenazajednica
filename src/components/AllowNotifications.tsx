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

  const rawData =
    window.atob(base64);

  const buffer =
    new ArrayBuffer(
      rawData.length
    );

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
// TYPES
// =========================================================

interface SaveResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

interface PushStatusResponse {
  success?: boolean;
  subscribed?: boolean;
  uid?: number;
  subscription_id?: number | null;
  endpoint?: string | null;
  error?: string;
}

// =========================================================
// WAIT FOR SERVICE WORKER
// =========================================================

async function waitForServiceWorker(
  registration: ServiceWorkerRegistration
): Promise<ServiceWorkerRegistration> {
  // Već je aktivan.
  if (registration.active) {
    console.log(
      "✅ Service Worker je već active."
    );

    return registration;
  }

  console.log(
    "⏳ Čekam Service Worker activation..."
  );

  return new Promise(
    (resolve, reject) => {
      const worker =
        registration.installing ||
        registration.waiting;

      if (!worker) {
        reject(
          new Error(
            "Service Worker nema installing, waiting ni active stanje."
          )
        );

        return;
      }

      const timeout =
        window.setTimeout(
          () => {
            reject(
              new Error(
                "Service Worker nije postao active."
              )
            );
          },
          10000
        );

      worker.addEventListener(
        "statechange",
        () => {
          console.log(
            "🔄 Service Worker state:",
            worker.state
          );

          if (
            worker.state ===
            "activated"
          ) {
            window.clearTimeout(
              timeout
            );

            resolve(
              registration
            );
          }

          if (
            worker.state ===
            "redundant"
          ) {
            window.clearTimeout(
              timeout
            );

            reject(
              new Error(
                "Service Worker je postao redundant."
              )
            );
          }
        }
      );

      // Dodatna provera.
      if (registration.active) {
        window.clearTimeout(
          timeout
        );

        resolve(
          registration
        );
      }
    }
  );
}

// =========================================================
// COMPONENT
// =========================================================

export default function AllowNotifications() {
  const [loading, setLoading] =
    useState(false);

  const [enabled, setEnabled] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  // =======================================================
  // CHECK SUBSCRIPTION
  // =======================================================

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      setChecking(true);

      console.log(
        "🔍 PROVERA PUSH STATUSA"
      );

      // ---------------------------------------------------
      // 1. BROWSER SUPPORT
      // ---------------------------------------------------

      if (
        !("serviceWorker" in navigator)
      ) {
        console.log(
          "❌ Service Worker nije podržan."
        );

        setEnabled(false);

        return;
      }

      if (
        !("PushManager" in window)
      ) {
        console.log(
          "❌ PushManager nije podržan."
        );

        setEnabled(false);

        return;
      }

      // ---------------------------------------------------
      // 2. SERVICE WORKER
      // ---------------------------------------------------

      const registration =
        await navigator.serviceWorker
          .getRegistration();

      if (!registration) {
        console.log(
          "ℹ️ Nema registrovanog Service Workera."
        );

        setEnabled(false);

        return;
      }

      console.log(
        "✅ Service Worker pronađen:",
        registration
      );

      console.log(
        "📄 ACTIVE:",
        registration.active
      );

      console.log(
        "⏳ WAITING:",
        registration.waiting
      );

      console.log(
        "🔄 INSTALLING:",
        registration.installing
      );

      if (!registration.active) {
        console.log(
          "ℹ️ Service Worker još nije active."
        );

        setEnabled(false);

        return;
      }

      // ---------------------------------------------------
      // 3. BROWSER PUSH SUBSCRIPTION
      // ---------------------------------------------------

      const browserSubscription =
        await registration
          .pushManager
          .getSubscription();

      console.log(
        "📦 Browser subscription:",
        browserSubscription
      );

      const browserSubscribed =
        Boolean(
          browserSubscription
        );

      console.log(
        "🌐 Browser subscribed:",
        browserSubscribed
      );

      // ---------------------------------------------------
      // 4. DRUPAL DATABASE STATUS
      // ---------------------------------------------------

      console.log(
        "🗄️ Proveravam Drupal bazu..."
      );

      const response =
        await fetch(
          "/api/push/status",
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",
          }
        );

      const responseText =
        await response.text();

      console.log(
        "📥 Push status odgovor:",
        responseText
      );

      let data:
        | PushStatusResponse
        | null = null;

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;
      } catch {
        data = {
          success: false,
          subscribed: false,
          error:
            responseText,
        };
      }

      // ---------------------------------------------------
      // 5. DRUPAL ERROR
      // ---------------------------------------------------

      if (!response.ok) {
        console.error(
          "❌ Drupal status error:",
          data
        );

        setEnabled(false);

        return;
      }

      const databaseSubscribed =
        Boolean(
          data?.subscribed
        );

      console.log(
        "🗄️ Drupal DB subscribed:",
        databaseSubscribed
      );

      // ---------------------------------------------------
      // 6. FINAL STATUS
      // ---------------------------------------------------

      const isEnabled =
        browserSubscribed &&
        databaseSubscribed;

      console.log(
        "================================"
      );

      console.log(
        "🌐 Browser:",
        browserSubscribed
      );

      console.log(
        "🗄️ Drupal DB:",
        databaseSubscribed
      );

      console.log(
        "🔔 FINAL SWITCH:",
        isEnabled
      );

      console.log(
        "================================"
      );

      setEnabled(
        isEnabled
      );

      // ---------------------------------------------------
      // 7. IMPORTANT: DB POSTOJI,
      //    ALI BROWSER NEMA SUBSCRIPTION
      // ---------------------------------------------------

      if (
        databaseSubscribed &&
        !browserSubscribed
      ) {
        console.warn(
          "⚠️ Drupal ima subscription, ali browser nema subscription."
        );
      }

    } catch (error) {
      console.error(
        "❌ Greška prilikom provere:",
        error
      );

      setEnabled(false);

    } finally {
      setChecking(false);

      console.log(
        "✅ Provera završena."
      );
    }
  }

  // =======================================================
  // ENABLE
  // =======================================================

  async function enableNotifications() {
    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      console.log(
        "🟢 UKLJUČIVANJE NOTIFIKACIJA"
      );

      // ---------------------------------------------------
      // CHECK SUPPORT
      // ---------------------------------------------------

      if (
        !("Notification" in window)
      ) {
        throw new Error(
          "Browser ne podržava notifikacije."
        );
      }

      if (
        !("serviceWorker" in navigator)
      ) {
        throw new Error(
          "Service Worker nije podržan."
        );
      }

      if (
        !("PushManager" in window)
      ) {
        throw new Error(
          "Push notifikacije nisu podržane."
        );
      }

      // ---------------------------------------------------
      // REGISTER SERVICE WORKER
      // ---------------------------------------------------

      console.log(
        "🔧 Registrujem Service Worker..."
      );

      const registration =
        await navigator.serviceWorker
          .register(
            "/sw.js",
            {
              scope: "/",
            }
          );

      console.log(
        "✅ Service Worker registrovan:",
        registration
      );

      console.log(
        "📄 ACTIVE:",
        registration.active
      );

      console.log(
        "⏳ WAITING:",
        registration.waiting
      );

      console.log(
        "🔄 INSTALLING:",
        registration.installing
      );

      // ---------------------------------------------------
      // WAIT FOR ACTIVATION
      // ---------------------------------------------------

      const readyRegistration =
        await waitForServiceWorker(
          registration
        );

      if (
        !readyRegistration.active
      ) {
        throw new Error(
          "Service Worker nije postao active."
        );
      }

      console.log(
        "✅ Service Worker ACTIVE:",
        readyRegistration.active
      );

      console.log(
        "📄 ACTIVE SCRIPT:",
        readyRegistration
          .active
          .scriptURL
      );

      // ---------------------------------------------------
      // NOTIFICATION PERMISSION
      // ---------------------------------------------------

      let permission =
        Notification.permission;

      console.log(
        "🔔 Trenutna dozvola:",
        permission
      );

      if (
        permission !==
        "granted"
      ) {
        permission =
          await Notification
            .requestPermission();
      }

      console.log(
        "🔔 Nova dozvola:",
        permission
      );

      if (
        permission !==
        "granted"
      ) {
        throw new Error(
          "Dozvola za notifikacije nije odobrena."
        );
      }

      // ---------------------------------------------------
      // GET VAPID KEY
      // ---------------------------------------------------

      console.log(
        "🔑 Učitavam VAPID public key..."
      );

      const vapidResponse =
        await fetch(
          "/api/push/vapid-public-key",
          {
            method: "GET",
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
        vapidData?.publicKey;

      if (!publicKey) {
        throw new Error(
          "VAPID public key nije pronađen."
        );
      }

      console.log(
        "✅ VAPID public key pronađen."
      );

      // ---------------------------------------------------
      // CHECK EXISTING BROWSER SUBSCRIPTION
      // ---------------------------------------------------

      let subscription =
        await readyRegistration
          .pushManager
          .getSubscription();

      console.log(
        "📦 Postojeći subscription:",
        subscription
      );

      // ---------------------------------------------------
      // CREATE SUBSCRIPTION
      // ---------------------------------------------------

      if (!subscription) {
        console.log(
          "➕ Kreiram novi Push subscription..."
        );

        subscription =
          await readyRegistration
            .pushManager
            .subscribe({
              userVisibleOnly: true,

              applicationServerKey:
                urlBase64ToArrayBuffer(
                  publicKey
                ),
            });

        console.log(
          "✅ Subscription kreiran:",
          subscription
        );
      }

      if (!subscription) {
        throw new Error(
          "Subscription nije kreiran."
        );
      }

      // ---------------------------------------------------
      // SAVE SUBSCRIPTION
      // ---------------------------------------------------

      console.log(
        "📤 Šaljem subscription serveru..."
      );

      const response =
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
        await response.text();

      console.log(
        "📥 Server odgovor:",
        responseText
      );

      let data:
        | SaveResponse
        | null = null;

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;
      } catch {
        data = {
          error:
            responseText,
        };
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Subscription nije sačuvan."
        );
      }

      // ---------------------------------------------------
      //  VERIFY DATABASE
      // ---------------------------------------------------

      console.log(
        "🔍 Proveravam da li je subscription zaista u Drupal bazi..."
      );

      const statusResponse =
        await fetch(
          "/api/push/status",
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",
          }
        );

      const statusText =
        await statusResponse.text();

      console.log(
        "📥 Status nakon subscribe:",
        statusText
      );

      let statusData:
        | PushStatusResponse
        | null = null;

      try {
        statusData =
          statusText
            ? JSON.parse(
                statusText
              )
            : null;
      } catch {
        statusData = null;
      }

      if (
        !statusResponse.ok ||
        !statusData?.subscribed
      ) {
        throw new Error(
          "Subscription je sačuvan, ali Drupal baza nije potvrdila aktivnu pretplatu."
        );
      }

      // ---------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------

      setEnabled(true);
      setSuccess(true);

      setMessage(
        data?.message ||
          "Notifikacije su uspešno uključene."
      );

      console.log(
        "🟢 NOTIFIKACIJE UKLJUČENE"
      );

    } catch (error) {
      console.error(
        "❌ Enable error:",
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
  // DISABLE
  // =======================================================

  async function disableNotifications() {
    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      console.log(
        "🔴 ISKLJUČIVANJE NOTIFIKACIJA"
      );

      if (
        !("serviceWorker" in navigator)
      ) {
        throw new Error(
          "Service Worker nije podržan."
        );
      }

      // ---------------------------------------------------
      // GET SERVICE WORKER
      // ---------------------------------------------------

      const registration =
        await navigator.serviceWorker
          .getRegistration();

      if (!registration) {
        setEnabled(false);
        setSuccess(true);

        setMessage(
          "Notifikacije su već isključene."
        );

        return;
      }

      if (!registration.active) {
        setEnabled(false);
        setSuccess(true);

        setMessage(
          "Notifikacije su već isključene."
        );

        return;
      }

      // ---------------------------------------------------
      // GET SUBSCRIPTION
      // ---------------------------------------------------

      const subscription =
        await registration
          .pushManager
          .getSubscription();

      console.log(
        "📦 Subscription:",
        subscription
      );

      if (!subscription) {
        setEnabled(false);
        setSuccess(true);

        setMessage(
          "Notifikacije su već isključene."
        );

        return;
      }

      // ---------------------------------------------------
      // REMOVE FROM SERVER
      // ---------------------------------------------------

      console.log(
        "📤 Brišem subscription sa servera..."
      );

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

      console.log(
        "📥 Server odgovor:",
        responseText
      );

      let data:
        | SaveResponse
        | null = null;

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;
      } catch {
        data = {
          error:
            responseText,
        };
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Subscription nije obrisan sa servera."
        );
      }

      // ---------------------------------------------------
      // REMOVE FROM BROWSER
      // ---------------------------------------------------

      console.log(
        "🗑️ Brišem subscription iz browsera..."
      );

      const unsubscribed =
        await subscription.unsubscribe();

      console.log(
        "🗑️ Browser unsubscribe:",
        unsubscribed
      );

      // ---------------------------------------------------
      // VERIFY DATABASE
      // ---------------------------------------------------

      console.log(
        "🔍 Proveravam Drupal bazu nakon unsubscribe..."
      );

      const statusResponse =
        await fetch(
          "/api/push/status",
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",
          }
        );

      const statusText =
        await statusResponse.text();

      console.log(
        "📥 Status nakon unsubscribe:",
        statusText
      );

      let statusData:
        | PushStatusResponse
        | null = null;

      try {
        statusData =
          statusText
            ? JSON.parse(
                statusText
              )
            : null;
      } catch {
        statusData = null;
      }

      // ---------------------------------------------------
      // FINAL
      // ---------------------------------------------------

      setEnabled(false);
      setSuccess(true);

      if (
        statusResponse.ok &&
        statusData?.subscribed ===
          false
      ) {
        setMessage(
          data?.message ||
            "Notifikacije su uspešno isključene."
        );
      } else {
        setMessage(
          "Browser subscription je uklonjen, ali proveru Drupal baze nije bilo moguće potvrditi."
        );
      }

      console.log(
        "🔴 NOTIFIKACIJE ISKLJUČENE"
      );

    } catch (error) {
      console.error(
        "❌ Disable error:",
        error
      );

      await checkSubscription();

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
  // SWITCH CLICK
  // =======================================================

  async function handleSwitchClick() {
    console.log(
      "🖱️ SWITCH CLICK",
      {
        enabled,
        loading,
        checking,

        permission:
          "Notification" in window
            ? Notification.permission
            : "unsupported",
      }
    );

    // Operacija u toku.
    if (loading) {
      console.log(
        "⏳ Operacija je već u toku."
      );

      return;
    }

    if (enabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
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
            {checking
              ? "Provera..."
              : enabled
              ? "Notifikacije su uključene."
              : "Notifikacije su isključene."}
          </p>

        </div>

        {/* SWITCH */}

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Push notifikacije"
          aria-busy={loading}
          onClick={
            handleSwitchClick
          }
          disabled={
            loading || checking
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

      </div>

      {/* STATUS */}

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

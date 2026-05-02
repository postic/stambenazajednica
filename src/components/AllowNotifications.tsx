"use client";

import { useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

export default function AllowNotifications() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const requestPermission = async () => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    setLoading(true);

    try {
      // 1. Permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setOpen(false);
        return;
      }

      // 2. Service Worker (obavezno za FCM)
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      }

      // mali delay (IndexedDB fix)
      await new Promise((r) => setTimeout(r, 300));

      // 3. Guard za messaging
      if (!messaging) {
        console.log("Messaging nije dostupan (SSR ili unsupported browser)");
        setOpen(false);
        return;
      }

      // 4. Get FCM token
      const fcmToken = await getToken(messaging, {
        vapidKey:
          "BCeaqu0ItePlxM18_gYo-fdAxc2OtF2nFI3qr0-F64SiUqhMlXRTeib8fDETjH_M4FEJYVif5--bKG81-jknyqU",
      });

      console.log("FCM TOKEN:", fcmToken);

      if (!fcmToken) {
        setOpen(false);
        return;
      }

      setToken(fcmToken);

      // 5. Snimanje u backend (Drupal)
      await fetch("/api/fcm/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: fcmToken }),
      });

      setOpen(false);
    } catch (e) {
      console.error("FCM error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={() => !loading && setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 92vw)",
          background: "#ffffff",
          color: "#111827",
          borderRadius: 16,
          padding: 22,
          boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18 }}>
          Dozvoli notifikacije
        </h3>

        <p style={{ fontSize: 14, opacity: 0.75, marginTop: 10 }}>
          Uključi notifikacije da dobijaš važne poruke u realnom vremenu.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={() => setOpen(false)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#f3f4f6",
              cursor: "pointer",
            }}
          >
            Kasnije
          </button>

          <button
            onClick={requestPermission}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "#111827",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Čuvam..." : "Dozvoli"}
          </button>
        </div>

        {/* DEBUG TOKEN */}
        {token && (
          <div
            style={{
              marginTop: 15,
              padding: 10,
              fontSize: 12,
              background: "#f9fafb",
              borderRadius: 10,
              wordBreak: "break-all",
              border: "1px solid #e5e7eb",
            }}
          >
            <strong>FCM Token:</strong>
            <div>{token}</div>
          </div>
        )}
      </div>
    </div>
  );
}

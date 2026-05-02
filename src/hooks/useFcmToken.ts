"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/firebase";
import { messaging } from "@/lib/firebase";

export function useFcmToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function requestPermission() {
      if (!messaging) return;

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.log("Permission denied");
        return;
      }

      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });

      if (currentToken) {
        setToken(currentToken);

        // šaljemo backendu
        await fetch("/api/save-token", {
          method: "POST",
          body: JSON.stringify({ token: currentToken }),
        });
      }
    }

    requestPermission();
  }, []);

  return token;
}

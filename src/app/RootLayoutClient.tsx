"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 🔧 NProgress konfiguracija
NProgress.configure({
  minimum: 0.08,
  easing: "ease-out",
  speed: 500,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: false,
});

export default function RootLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // 🚀 SERVICE WORKER REGISTRATION
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("✅ SW registered:", reg.scope);
        })
        .catch((err) => {
          console.error("❌ SW registration failed:", err);
        });
    }
  }, []);

  // ⏳ NProgress routing effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const startDelay = setTimeout(() => {
      NProgress.start();
    }, 150);

    timeout = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeout);

      setTimeout(() => {
        NProgress.done();
      }, 100);
    };
  }, [pathname]);

  return <>{children}</>;
}

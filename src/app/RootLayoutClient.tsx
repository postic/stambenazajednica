"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 🔧 NProgress konfiguracija (globalno)
NProgress.configure({
  minimum: 0.08,
  easing: "ease-out",
  speed: 500,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: false,
});

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // ⏳ delay da se ne prikazuje za ultra brze rute
    const startDelay = setTimeout(() => {
      NProgress.start();
    }, 150);

    // ⏱ minimalno trajanje + smooth finish
    timeout = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeout);

      // mali delay za lep završetak
      setTimeout(() => {
        NProgress.done();
      }, 100);
    };
  }, [pathname]);

  return <>{children}</>;
}

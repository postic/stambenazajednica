// components/GlobalProgress.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GlobalProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    setVisible(true);
    setProgress(10);

    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    // simulacija završetka
    const timeout = setTimeout(() => {
      setProgress(100);

      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-transparent">
      <div
        className="h-full bg-black transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

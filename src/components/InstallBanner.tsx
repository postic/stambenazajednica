"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function InstallButton() {
  const { canInstall, install } = usePWAInstall();

  // 🚫 ako Chrome ne daje signal → ništa ne prikazuj
  if (!canInstall) return null;

  return (
    <button
      onClick={install}
      className="
        fixed bottom-4 right-4
        bg-blue-600 text-white
        px-4 py-2 rounded-xl
        shadow-lg
      "
    >
      📲 Install App
    </button>
  );
}

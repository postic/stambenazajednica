"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export default function InstallBanner() {
  const { install, isInstallable, isIOS } = useInstallPrompt();

  if (!isInstallable && !isIOS) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-black text-white p-4 rounded-2xl shadow-lg flex justify-between items-center">
        <span>
          Instaliraj Komšija aplikaciju
        </span>

        {isInstallable && (
          <button
            onClick={install}
            className="bg-blue-500 px-3 py-1 rounded"
          >
            Instaliraj
          </button>
        )}

        {isIOS && (
          <span className="text-sm">
            Share → Add to Home Screen
          </span>
        )}
      </div>
    </div>
  );
}

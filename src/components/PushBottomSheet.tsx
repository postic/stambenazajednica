"use client";

import { useEffect, useState } from "react";
import { registerPush } from "@/lib/push/register";

export default function PushPermissionCard() {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("push_prompt_closed");

    if (Notification.permission === "default" && !dismissed) {
      const t = setTimeout(() => {
        setOpen(true);
        setAnimating(true);
      }, 1200);

      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setAnimating(false);

    setTimeout(() => {
      setOpen(false);
      localStorage.setItem("push_prompt_closed", "1");
    }, 200);
  };

  const enable = async () => {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      await registerPush();
    }

    close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          animating ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* card */}
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl px-6 py-7 transition-all duration-200 ${
          animating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >

        {/* title */}
        <h2 className="text-[17px] font-semibold text-gray-900 leading-snug">
          Omogući obaveštenja za svoju zgradu
        </h2>

        {/* description */}
        <p className="text-[13px] text-gray-500 mt-3 leading-relaxed">
          Budi u toku sa važnim informacijama u realnom vremenu, uključujući finansijske promene,
          odluke zajednice i prijave kvarova.
        </p>

        {/* divider */}
        <div className="my-5 border-t border-gray-100" />

        {/* benefits */}
        <div className="space-y-2 text-[13px] text-gray-700 leading-relaxed">
          <p>Obaveštenja o stanju računa i uplatama</p>
          <p>Glasanja i ankete u zgradi</p>
          <p>Prijave i statusi kvarova</p>
        </div>

        {/* actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={enable}
            className="flex-1 bg-gray-900 text-white text-[13px] py-2.5 rounded-xl font-medium active:scale-[0.98] transition"
          >
            Omogući
          </button>

          <button
            onClick={close}
            className="flex-1 bg-gray-100 text-gray-700 text-[13px] py-2.5 rounded-xl hover:bg-gray-200 transition"
          >
            Kasnije
          </button>
        </div>

        {/* footer note */}
        {/*
          <p className="text-[11px] text-gray-400 mt-4 text-center">
            Podešavanja možeš promeniti u bilo kom trenutku
          </p>
        */}

      </div>
    </div>
  );
}

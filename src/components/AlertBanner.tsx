"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export default function AlertBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-between">
      <span>
        Za obaveštenja i ostale opcije posetite {" "}
        <Link
          href="/podesavanja"
          className="font-semibold"
        >
          podešavanja
        </Link>
        .
      </span>

      <button
        onClick={() => setVisible(false)}
        aria-label="Zatvori obaveštenje"
        className="ml-4 shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
}

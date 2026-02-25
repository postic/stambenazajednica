"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AlertBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-blue-500 text-white px-6 py-2 flex items-center justify-between">
      <span>System maintenance scheduled at 12:00 AM</span>
      <button onClick={() => setVisible(false)}>
        <X size={18} />
      </button>
    </div>
  );
}

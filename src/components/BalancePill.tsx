"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

export default function BalancePill() {

  const [balance, setBalance] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/balance");

        if (!res.ok) {
          console.error("API ERROR:", res.status);
          return;
        }

        const data = await res.json();
        setBalance(data.balance ?? 0);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    }

    load();
  }, []);

  if (balance === null) {
    return (
      <div className="fixed bottom-5 right-5 px-4 py-2 border border-gray-200 text-gray-400 text-sm">
        ...
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push("/transakcije")}
      className="
        fixed bottom-5 right-5 z-50
        flex items-center gap-2
        px-4 py-2
        border border-red-200
        bg-red-50/70
        text-red-700 text-sm
        hover:bg-red-100/70
        transition-colors
      "
    >
      <Wallet className="w-4 h-4 text-red-600" />
      <span className="font-medium">
        {balance.toLocaleString("sr-RS")} RSD
      </span>
    </button>
  );
}

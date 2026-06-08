"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function BalancePill() {
  const [balance, setBalance] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/balance");
        if (!res.ok) return;

        const data = await res.json();
        setBalance(data.balance ?? 0);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  if (balance === null) {
    return (
      <div className="fixed bottom-5 right-5 px-4 py-2 border border-slate-200 bg-white text-slate-400 text-sm">
        učitavanje...
      </div>
    );
  }

  const isPositive = balance >= 0;

  const formatted = new Intl.NumberFormat("sr-Latn-RS", {
    style: "currency",
    currency: "RSD",
  }).format(balance);

  return (
    <button
      onClick={() => router.push("/transakcije")}
      className={`
        fixed bottom-5 right-5 z-1
        flex items-center gap-3
        px-4 py-3
        border
        text-sm
        shadow-sm
        transition-colors

        ${
          isPositive
            ? "bg-green-600 border-green-700 hover:bg-green-700 text-white"
            : "bg-red-600 border-red-700 hover:bg-red-700 text-white"
        }
      `}
    >
      {/* ICON */}
      {isPositive ? (
        <TrendingUp className="w-4 h-4 text-white" />
      ) : (
        <TrendingDown className="w-4 h-4 text-white" />
      )}

      {/* TEXT */}
      <div className="flex flex-col leading-tight text-left">
        <span className="text-[10px] uppercase tracking-wider opacity-80">
          Stanje računa
        </span>

        <span className="font-semibold tabular-nums">
          {formatted}
        </span>
      </div>
    </button>
  );
}

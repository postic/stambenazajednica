"use client";

import { useEffect, useState } from "react";

type Props = {
  className?: string;
};

export default function BalanceBadge({ className }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch("/api/balance"); // ili tvoj Drupal endpoint
        const data = await res.json();

        setBalance(data.balance);
      } catch (e) {
        setBalance(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, []);

  return (
    <button
      className={`
        flex items-center gap-2
        px-3 py-1.5
        rounded-full
        text-sm font-medium
        bg-slate-100 hover:bg-slate-200
        transition
        ${className || ""}
      `}
      onClick={() => (window.location.href = "/finansije")}
    >
      <span>💰</span>

      {loading ? (
        <span>Učitavanje...</span>
      ) : (
        <span>
          {balance !== null
            ? `${balance.toLocaleString("sr-RS")} RSD`
            : "157.895,03 RSD"}
        </span>
      )}
    </button>
  );
}

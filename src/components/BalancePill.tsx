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

        console.log("BALANCE API RESPONSE:", data);

        setBalance(data.balance ?? 0);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    }

    load();
  }, []);

  if (balance === null) {
    return (
      <div className="fixed bottom-5 right-5 px-4 py-2 rounded-full bg-gray-300 animate-pulse">
        ...
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push("/transakcije")}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white shadow-lg"
    >
      <Wallet className="w-4 h-4" />
      <span>{balance.toLocaleString("sr-RS")} RSD</span>
    </button>
  );
}

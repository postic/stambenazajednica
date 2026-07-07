"use client";

import { useEffect, useState } from "react";
import { Home, Users, Wallet } from "lucide-react";
import StatCard from "@/components/StatCard";

export default function Statistics() {
  const [stats, setStats] = useState({
    stanovi: 0,
    stanari: 0,
  });

  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    async function loadStatistics() {
      try {
        const [statsRes, balanceRes] = await Promise.all([
          fetch("/api/statistics"),
          fetch("/api/balance"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();

          setStats({
            stanovi: data.stanovi ?? 0,
            stanari: data.stanari ?? 0,
          });
        }

        if (balanceRes.ok) {
          const data = await balanceRes.json();

          setBalance(data.balance ?? 0);
        }

      } catch (error) {
        console.error("Statistics error:", error);
      }
    }

    loadStatistics();
  }, []);


  const formattedBalance = new Intl.NumberFormat(
    "sr-Latn-RS",
    {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 0,
    }
  ).format(balance);


  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">

      <StatCard
        icon={
          <Home className="h-6 w-6 text-green-600" />
        }
        value={stats.stanovi}
        label="Ukupno stanova"
      />


      <StatCard
        icon={
          <Users className="h-6 w-6 text-blue-600" />
        }
        value={stats.stanari}
        label="Prijavljenih stanara"
      />


      <StatCard
        icon={
          <Wallet className="h-6 w-6 text-emerald-600" />
        }
        value={formattedBalance}
        label="Stanje računa"
      />

    </div>
  );
}

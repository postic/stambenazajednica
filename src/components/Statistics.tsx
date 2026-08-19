"use client";

import { useEffect, useState } from "react";
import { Home, Users, Wallet, Key } from "lucide-react";
import StatCard from "@/components/StatCard";

export default function Statistics() {
  const [stats, setStats] = useState({
    prostori: 0,
    stanari: 0,
  });

  const [balance, setBalance] = useState<number>(0);
  const [doorCode, setDoorCode] = useState<string>("****");

  useEffect(() => {
    async function loadStatistics() {
      try {
        const [statsRes, balanceRes, codeRes] = await Promise.all([
          fetch("/api/statistics"),
          fetch("/api/balance"),
          fetch("/api/zgrada-config"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();

          setStats({
            prostori: data.prostori ?? 0,
            stanari: data.stanari ?? 0,
          });
        }

        if (balanceRes.ok) {
          const data = await balanceRes.json();
          setBalance(data.balance ?? 0);
        }

        if (codeRes.ok) {
          const data = await codeRes.json();
          setDoorCode(data.door_code ?? "****");
        }

      } catch (error) {
        console.error("Statistics error:", error);
      }
    }

    loadStatistics();
  }, []);

  const formattedBalance = new Intl.NumberFormat("sr-RS").format(balance);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={<Wallet className="h-5 w-5 text-emerald-600" />}
        value={formattedBalance}
        label="Račun"
      />

      <StatCard
        icon={<Key className="h-5 w-5 text-yellow-600" />}
        value={doorCode}
        label="Šifra"
      />

      <StatCard
        icon={<Home className="h-5 w-5 text-red-600" />}
        value={stats.prostori}
        label="Prostori"
      />

      <StatCard
        icon={<Users className="h-5 w-5 text-blue-600" />}
        value={stats.stanari}
        label="Stanari"
      />
    </div>
  );
}

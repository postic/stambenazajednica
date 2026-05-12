"use client";

import { useEffect, useState } from "react";

type Stats = {
  kvarovi: number;
  obavestenja: number;
  ankete: number;
  sednice: number;
  stanari: number;
  stanovi: number;
  telefoni: number;
  transakcije: number;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<Stats>({
    kvarovi: 0,
    obavestenja: 0,
    ankete: 0,
    sednice: 0,
    stanari: 0,
    stanovi: 0,
    telefoni: 0,
    transakcije: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch("/api/dashboard");

        if (!res.ok) {
          throw new Error("Failed to load dashboard stats");
        }

        const data = await res.json();

        setStats({
          kvarovi: data.kvarovi ?? 0,
          obavestenja: data.obavestenja ?? 0,
          ankete: data.ankete ?? 0,
          sednice: data.sednice ?? 0,
          stanari: data.stanari ?? 0,
          stanovi: data.stanovi ?? 0,
          telefoni: data.telefoni ?? 0,
          transakcije: data.transakcije ?? 0,
        });
      } catch (e) {
        console.error("Dashboard stats error:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { stats, loading };
}

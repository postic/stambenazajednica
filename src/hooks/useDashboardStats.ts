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
        const data = await res.json();

        setStats(data);
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

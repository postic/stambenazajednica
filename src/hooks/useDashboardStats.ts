"use client";

import { useEffect, useState } from "react";

type Stats = {
  kvarovi: number;
  obavestenja: number;
  ankete: number;
  stanari: number;
  stanovi: number;
  telefoni: number;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<Stats>({
    kvarovi: 0,
    obavestenja: 0,
    ankete: 0,
    stanari: 0,
    stanovi: 0,
    telefoni: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

    async function load() {
      try {
        setLoading(true);

        const [kvarovi, obavestenja, ankete, stanari, stanovi, transakcije, telefoni] =
          await Promise.all([
            fetch(`${base}/jsonapi/node/kvar`).then((r) => r.json()),
            fetch(`${base}/jsonapi/node/obavestenje`).then((r) => r.json()),
            fetch(`${base}/jsonapi/node/anketa`).then((r) => r.json()),
            fetch(`${base}/jsonapi/user/user`).then((r) => r.json()),
            fetch(`${base}/jsonapi/node/stan`).then((r) => r.json()),
            fetch(`${base}/jsonapi/node/transakcija`).then((r) => r.json()),
            fetch(`${base}/jsonapi/node/telefon`).then((r) => r.json()),
          ]);

        setStats({
          kvarovi: kvarovi?.data?.length ?? 0,
          obavestenja: obavestenja?.data?.length ?? 0,
          ankete: ankete?.data?.length ?? 0,
          stanari: stanari?.data?.length ?? 0,
          stanovi: stanovi?.data?.length ?? 0,
          transakcije: transakcije?.data?.length ?? 0,
          telefoni: transakcije?.data?.length ?? 0,
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

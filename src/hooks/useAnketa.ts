"use client";

import { useEffect, useState } from "react";
import { fetchAnketa, fetchRezultati } from "@/lib/api";

type OptionWithStats = {
  id: string;
  title?: string;
  votes: number;
  percent: number;
};

type AnketaState = {
  id: string;
  title?: string;
  body?: string;
  options: OptionWithStats[];
  totalVotes: number;
};

export function useAnketa(id: string) {
  const [anketa, setAnketa] = useState<AnketaState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🟢 ANKETA
      const data = await fetchAnketa(id);

      // 🟢 REZULTATI
      const results = await fetchRezultati(id);

      // 🟢 TOTAL VOTES (FIX)
      const totalVotes = results.reduce(
        (sum, item) => sum + (item.votes ?? 0),
        0
      );

      // 🟢 OPTIONS + PERCENT
      const options: OptionWithStats[] = results.map((opt) => ({
        id: opt.id,
        title: opt.title,
        votes: opt.votes ?? 0,
        percent:
          totalVotes > 0 ? ((opt.votes ?? 0) / totalVotes) * 100 : 0,
      }));

      setAnketa({
        id: data.id,
        title: data.title,
        body: data.body,
        options,
        totalVotes,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Greška pri učitavanju ankete");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  return {
    anketa,
    loading,
    error,
    refresh: load,
  };
}

// hooks/useAnketa.ts
import { useState, useEffect } from "react";
import { Anketa } from "@/features/ankete/types";
import { fetchAnketa, fetchRezultati } from "@/lib/api";

export function useAnketa(id: string) {
  const [anketa, setAnketa] = useState<Anketa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchAnketa(id);
      const results = await fetchRezultati(id);

      const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

      const options = data.options.map((opt) => ({
        ...opt,
        votes: results[opt.id] || 0,
        percentage: totalVotes ? Math.round(((results[opt.id] || 0) / totalVotes) * 100) : 0,
      }));

      setAnketa({ ...data, options });
      setLoading(false);
    }

    load();
  }, [id]);

  return { anketa, loading, setAnketa };
}

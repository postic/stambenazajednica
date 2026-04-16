"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { stanoviColumns } from "@/features/stanovi/StanoviColumns";
import type { Stan } from "@/types/stan";


export default function StanoviPage() {
  const [loading, setLoading] = useState(true);
  const [stanovi, setStanovi] = useState<Stan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    fetch(`/api/stanovi?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;

        setStanovi(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => {
        if (ignore) return;

        console.error("Greška pri učitavanju kvarova:", err);
        setStanovi([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page]);

  // generiše niz brojeva [1, 2, 3, ... totalPages]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      <h1 className="text-base uppercase tracking-wide font-semibold text-slate-700 mb-6">
        Stanovi
      </h1>

      {/* TABLE */}
      <DataTable<Kvar>
        data={stanovi}
        columns={stanoviColumns}
        loading={loading}
        emptyMessage="Nema podataka."
      />

      {/* Numerička paginacija */}
      <div className="flex justify-center mt-8 gap-2 flex-wrap">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition
              ${
                page === p
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }
            `}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

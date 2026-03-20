"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { Stan, stanoviColumns } from "@/features/stanovi/StanoviColumns";

export default function StanoviPage() {
  const [stanovi, setStanovi] = useState<Stan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/stanovi?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setStanovi(data.data);
        setTotalPages(data.totalPages);
      })
      .catch((err) => console.error("Greška pri učitavanju stanova:", err));
  }, [page]);

  // generiše niz brojeva [1, 2, 3, ... totalPages]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      <h1 className="text-base uppercase tracking-wide font-semibold text-slate-700 mb-6">
        Stanovi
      </h1>

      {/* Generički DataTable */}
      <DataTable
        data={stanovi}
        columns={stanoviColumns}
        emptyMessage="Nema prijavljenih stanova."
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

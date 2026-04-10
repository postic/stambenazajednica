"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { kvaroviColumns } from "@/features/kvarovi/KvaroviColumns";
import { Kvar } from "@/features/kvarovi/types";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function KvaroviPage() {
  const [kvarovi, setKvarovi] = useState<Kvar[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/kvarovi?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setKvarovi(data.data);
        setTotalPages(data.totalPages);
      })
      .catch((err) => console.error("Greška pri učitavanju kvarova:", err));
  }, [page]);

  // generiše niz brojeva [1, 2, 3, ... totalPages]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-base uppercase tracking-wide font-semibold text-slate-700">
          Kvarovi
        </h1>

        <Link
          href="/kvarovi/new" className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition"
        >
        <Plus className="w-4 h-4" />Dodaj kvar
        </Link>
      </div>

      {/* Generički DataTable */}
      <DataTable
        data={kvarovi}
        columns={kvaroviColumns}
        emptyMessage="Nema prijavljenih kvarova."
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

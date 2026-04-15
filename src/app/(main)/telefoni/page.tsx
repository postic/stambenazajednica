"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { telefoniColumns } from "@/features/telefoni/TelefoniColumns";
import type { Telefon } from "@/types/telefon";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TelefoniPage() {
  const [loading, setLoading] = useState(true);
  const [telefoni, setTelefoni] = useState<Telefon[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {

    let ignore = false;
    setLoading(true);

    fetch(`/api/telefoni?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setTelefoni(data.data);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        if (ignore) return;

        console.error("Greška pri učitavanju kvarova:", err);
        setTelefoni([]);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-base uppercase tracking-wide font-semibold text-slate-700">
          Telefoni
        </h1>

        <Link
          href="/telefoni/new" className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition"
        >
        <Plus className="w-4 h-4" />Dodaj telefon
        </Link>
      </div>

      {/* TABLE */}
      <DataTable<Telefon>
        data={telefoni}
        columns={telefoniColumns}
        loading={loading}
        emptyMessage="Nema telefona."
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

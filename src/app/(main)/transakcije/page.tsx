"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { transakcijeColumns } from "@/features/transakcije/TransakcijeColumns";
import type { Transakcija } from "@/types/transakcija";
import { addRunningBalance } from "@/lib/transactions";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { TransakcijaWithBalance } from "@/types/transakcija";


export default function TransakcijePage() {
  const [transakcije, setTransakcije] = useState<TransakcijaWithBalance[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/transakcije?sort=-created&page=${page}&limit=10`);
        const json = await res.json();

        setTransakcije(json.data || []);
        setTotalPages(json.totalPages || 1);
      } catch (err) {
        console.error("Greška pri učitavanju transakcija:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  // 🔥 KLJUČNO: računanje stanja
  const data = transakcije;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            Transakcije
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Praćenje svih prihoda i rashoda stambene zajednice</p>
        </div>

      </div>

      <DataTable
        data={data}
        columns={transakcijeColumns}
        loading={loading}
        emptyMessage="Nema transakcija."
      />

      {/* PAGINATION */}
      <div className="flex justify-center mt-8 gap-2 flex-wrap">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition
              ${
                page === p
                  ? "bg-primary text-white border-primary"
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

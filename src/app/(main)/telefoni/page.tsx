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
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            Telefoni
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kontakti servisera, upravnika i važnih službi</p>
        </div>

      </div>

      {/* TABLE */}
      <DataTable<Telefon>
        data={telefoni}
        columns={telefoniColumns}
        loading={loading}
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

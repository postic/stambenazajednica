"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { projektiColumns } from "@/features/projekti/ProjektiColumns";
import type { Projekat } from "@/types/projekat";


export default function ProjektiPage() {
  const [loading, setLoading] = useState(true);
  const [projekti, setProjekti] = useState<Projekat[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    fetch(`/api/projekti?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;

        setProjekti(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => {
        if (ignore) return;

        console.error("Greška pri učitavanju projekata:", err);
        setProjekti([]);
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
            Projekti
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled planiranih, aktivnih i završenih projekata u zgradi</p>
        </div>

      </div>

      {/* TABLE */}
      <DataTable<Projekat>
        data={projekti}
        columns={projektiColumns}
        loading={loading}
        getRowHref={(projekat) => `/projekti/${projekat.id}`}
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

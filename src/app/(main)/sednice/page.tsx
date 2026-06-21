"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { sedniceColumns } from "@/features/sednice/SedniceColumns";
import type { Sednica } from "@/types/sednica";


export default function SednicePage() {
  const [loading, setLoading] = useState(true);
  const [sednice, setSednice] = useState<Sednica[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    fetch(`/api/sednice?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;

        setSednice(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => {
        if (ignore) return;

        console.error("Greška pri učitavanju sednica:", err);
        setSednice([]);
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
            Sednice
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Informacije o sastancima, odlukama i zapisnicima</p>
        </div>

      </div>

      {/* TABLE */}
      <DataTable<Sednica>
        data={sednice}
        columns={sedniceColumns}
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

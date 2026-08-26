"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { obavestenjaColumns } from "@/features/obavestenja/ObavestenjaColumns";
import type { Obavestenje } from "@/types/obavestenje";

export default function MojaObavestenjaPage() {
  const [loading, setLoading] = useState(true);
  const [obavestenja, setObavestenja] = useState<Obavestenje[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;

    setLoading(true);

    fetch(
      `/api/obavestenja?mine=1&page=${page}&limit=10`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Greška ${res.status} pri učitavanju obaveštenja`
          );
        }

        return res.json();
      })
      .then((data) => {
        if (ignore) return;

        setObavestenja(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => {
        if (ignore) return;

        console.error(
          "Greška pri učitavanju mojih obaveštenja:",
          err
        );

        setObavestenja([]);
        setTotalPages(1);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page]);

  // Numerička paginacija
  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Moja obaveštenja
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Obaveštenja koja ste kreirali
        </p>
      </div>

      {/* TABLE */}
      <DataTable<Obavestenje>
        data={obavestenja}
        columns={obavestenjaColumns}
        loading={loading}
      />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2 flex-wrap">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-2 rounded-md border text-sm font-medium transition ${
                page === p
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

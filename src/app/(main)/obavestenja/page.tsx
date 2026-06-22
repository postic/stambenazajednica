"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { obavestenjaColumns } from "@/features/obavestenja/ObavestenjaColumns";
import type { Obavestenje } from "@/types/obavestenje";
import { Plus } from "lucide-react";
import Link from "next/link";


export default function ObavestenjaPage() {
  const [loading, setLoading] = useState(true);
  const [obavestenja, setObavestenja] = useState<Obavestenje[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    fetch(`/api/obavestenja?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;

        setObavestenja(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => {
        if (ignore) return;

        console.error("Greška pri učitavanju kvarova:", err);
        setObavestenja([]);
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
            Obaveštenja
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Važne informacije i obaveštenja za stanare zgrade</p>
        </div>

        <div data-field>
          <Link
            href="/obavestenja/new"
            className="
              inline-flex h-10 w-10 items-center justify-center
              rounded-xl border border-gray-200
              bg-white text-gray-700
              hover:bg-gray-100
              transition
            "
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* TABLE */}
      <DataTable<Obavestenje>
        data={obavestenja}
        columns={obavestenjaColumns}
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

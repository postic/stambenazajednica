"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { DataTable } from "@/components/table/DataTable";

import { obavestenjaColumns } from "@/features/obavestenja/ObavestenjaColumns";

import type {
  Obavestenje,
} from "@/types/obavestenje";

export default function ObavestenjaKategorijaPage() {
  const params = useParams();

  const slug = params.slug as string;

  const [loading, setLoading] =
    useState(true);

  const [obavestenja, setObavestenja] =
    useState<Obavestenje[]>([]);

  useEffect(() => {
    if (!slug) return;

    let ignore = false;

    setLoading(true);

    fetch(`/api/obavestenja/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;

        setObavestenja(
          data.data ?? []
        );
      })
      .catch((err) => {
        if (ignore) return;

        console.error(
          "Greška pri učitavanju obaveštenja:",
          err
        );

        setObavestenja([]);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [slug]);

  const categoryName =
    obavestenja[0]?.categoryName ||
    "Obaveštenja";

  return (
    <div className="max-w-4xl">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="mt-3 text-xl font-semibold">
          {categoryName}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Obaveštenja iz izabrane kategorije
        </p>

      </div>

      {/* TABLE */}

      <DataTable<Obavestenje>
        data={obavestenja}
        columns={obavestenjaColumns}
        loading={loading}
      />

    </div>
  );
}

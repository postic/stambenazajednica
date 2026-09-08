"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/table/DataTable";

import { kategorijeColumns } from "@/features/obavestenja/KategorijeColumns";

import type {
  KategorijaObavestenja,
} from "@/types/obavestenje";

export default function ObavestenjaPage() {
  const [loading, setLoading] = useState(true);

  const [kategorije, setKategorije] =
    useState<KategorijaObavestenja[]>([]);

  useEffect(() => {
    let ignore = false;

    setLoading(true);

    fetch("/api/obavestenja")
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;

        setKategorije(data.data ?? []);
      })
      .catch((err) => {
        if (ignore) return;

        console.error(
          "Greška pri učitavanju kategorija:",
          err
        );

        setKategorije([]);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="max-w-4xl">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-xl font-semibold">
          Obaveštenja
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Obaveštenja organizovana po kategorijama
        </p>

      </div>

      {/* TABLE */}

      <DataTable<KategorijaObavestenja>
        data={kategorije}
        columns={kategorijeColumns}
        loading={loading}
      />

    </div>
  );
}

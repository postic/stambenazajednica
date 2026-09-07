"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/table/DataTable";

import { kategorijeColumns } from "@/features/telefoni/KategorijeColumns";

import type {
  KategorijaTelefona,
} from "@/types/telefon";

export default function TelefoniPage() {
  const [loading, setLoading] =
    useState(true);

  const [kategorije, setKategorije] =
    useState<KategorijaTelefona[]>([]);

  useEffect(() => {
    let ignore = false;

    setLoading(true);

    fetch("/api/telefoni")
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;

        setKategorije(
          data.data ?? []
        );
      })
      .catch((err) => {
        if (ignore) return;

        console.error(
          "Greška pri učitavanju kategorija telefona:",
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
          Telefoni
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Telefoni organizovani po kategorijama
        </p>

      </div>

      {/* TABLE */}

      <DataTable<KategorijaTelefona>
        data={kategorije}
        columns={kategorijeColumns}
        loading={loading}
      />

    </div>
  );
}

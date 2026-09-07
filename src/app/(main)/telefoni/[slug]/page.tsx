"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { DataTable } from "@/components/table/DataTable";
import type { Column } from "@/components/table/types";

import type { Telefon } from "@/types/telefon";

interface TelefoniResponse {
  data?: Telefon[];
  kategorija?: {
    id: string;
    name: string;
    slug: string;
  };
  error?: string;
}

export default function TelefoniKategorijaPage() {
  const params = useParams();

  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [telefoni, setTelefoni] = useState<Telefon[]>([]);
  const [nazivKategorije, setNazivKategorije] = useState("");

  useEffect(() => {
    if (!slug) return;

    let ignore = false;

    setLoading(true);

    fetch(`/api/telefoni/${slug}`)
      .then(async (res) => {
        const data: TelefoniResponse = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Greška pri učitavanju telefona"
          );
        }

        return data;
      })
      .then((data) => {
        if (ignore) return;

        setTelefoni(data.data ?? []);
        setNazivKategorije(data.kategorija?.name ?? "");
      })
      .catch((error) => {
        if (ignore) return;

        console.error("Greška pri učitavanju telefona:", error);

        setTelefoni([]);
        setNazivKategorije("");
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

  const columns: Column<Telefon>[] = [
    {
      key: "naziv",
      header: "Naziv",
      render: (row) => (
        <a
          href={`tel:${row.broj}`}
          className="font-medium text-slate-900 hover:underline"
        >
          {row.naziv}
        </a>
      ),
    },
    {
      key: "broj",
      header: "Telefon",
      render: (row) => (
        <a
          href={`tel:${row.broj}`}
          className="text-slate-900 hover:underline"
        >
          {row.broj}
        </a>
      ),
    },
  ];

  return (
    <div className="max-w-4xl">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-xl font-semibold">
          {nazivKategorije || "Telefoni"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Telefoni u ovoj kategoriji
        </p>

      </div>

      {/* TABLE */}

      <DataTable<Telefon>
        data={telefoni}
        columns={columns}
        loading={loading}
      />

    </div>
  );
}

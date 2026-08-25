"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DataTable } from "@/components/table/DataTable";

import {
  dokumentiColumns,
} from "@/features/dokumenti/DokumentiColumns";

import type {
  Dokument,
  KategorijaDokumenta,
} from "@/types/dokument";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function DokumentiKategorijaPage({
  params,
}: PageProps) {
  const [slug, setSlug] =
    useState<string>("");

  const [loading, setLoading] =
    useState(true);

  const [dokumenti, setDokumenti] =
    useState<Dokument[]>([]);

  const [category, setCategory] =
    useState<KategorijaDokumenta | null>(
      null
    );

  useEffect(() => {
    params.then(({ slug }) => {
      setSlug(slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    let ignore = false;

    setLoading(true);

    fetch(`/api/dokumenti/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Kategorija nije pronađena"
          );
        }

        return res.json();
      })
      .then((data) => {
        if (ignore) return;

        setDokumenti(
          data.data ?? []
        );

        setCategory(
          data.category ?? null
        );
      })
      .catch((err) => {
        if (ignore) return;

        console.error(
          "Greška pri učitavanju dokumenata:",
          err
        );

        setDokumenti([]);
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

  return (
    <div className="max-w-4xl">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-xl font-semibold">
          {category?.name || "Dokumenti"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Dokumenti iz kategorije
        </p>

      </div>

      {/* TABLE */}

      <DataTable<Dokument>
        data={dokumenti}
        columns={dokumentiColumns}
        loading={loading}
      />

    </div>
  );
}

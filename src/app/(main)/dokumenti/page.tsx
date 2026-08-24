"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Folder,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Kategorija {
  id: string;
  name: string;
  slug: string;
  dokumenti: any[];
}

export default function DokumentiPage() {
  const [kategorije, setKategorije] =
    useState<Kategorija[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadDokumenti() {
      try {
        setLoading(true);

        const response =
          await fetch("/api/dokumenti");

        if (!response.ok) {
          throw new Error(
            "Greška pri učitavanju"
          );
        }

        const result =
          await response.json();

        setKategorije(
          result.data || []
        );
      } catch (error) {
        console.error(error);

        setError(
          "Greška pri učitavanju dokumenata."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDokumenti();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2
          className="animate-spin text-slate-400"
          size={24}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* NASLOV */}

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dokumenti
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Dokumenti su organizovani po kategorijama.
        </p>
      </div>

      {/* KATEGORIJE */}

      <div className="space-y-2">

        {kategorije.map((kategorija) => (
          <Link
            key={kategorija.id}
            href={`/dokumenti/${kategorija.slug}`}
            className="
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-4
            "
          >
            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-100
                "
              >
                <Folder
                  size={20}
                  className="text-slate-500"
                />
              </div>

              <div>
                <div className="font-medium text-slate-900">
                  {kategorija.name}
                </div>

                <div className="mt-0.5 text-sm text-slate-400">
                  {kategorija.dokumenti.length}{" "}
                  {kategorija.dokumenti.length === 1
                    ? "dokument"
                    : "dokumenata"}
                </div>
              </div>

            </div>

            <ChevronRight
              size={20}
              className="text-slate-400"
            />

          </Link>
        ))}

      </div>

    </div>
  );
}

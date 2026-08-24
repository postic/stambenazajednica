"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";

interface Kategorija {
  id: string;
  name: string;
  slug: string;
}

interface Dokument {
  id: string;
  title: string;
  body: string;
  created: string;
  status: string;
  category: Kategorija;
}

export default function DokumentiKategorijaPage() {
  const params = useParams();

  const slug = params.slug as string;

  const [dokumenti, setDokumenti] =
    useState<Dokument[]>([]);

  const [category, setCategory] =
    useState<Kategorija | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!slug) return;

    async function loadDokumenti() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/dokumenti/${slug}`
        );

        if (!response.ok) {
          throw new Error(
            "Kategorija nije pronađena"
          );
        }

        const result =
          await response.json();

        setCategory(
          result.category || null
        );

        setDokumenti(
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
  }, [slug]);

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
      <div className="space-y-4">

        <Link
          href="/dokumenti"
          className="inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <ArrowLeft size={16} />
          Svi dokumenti
        </Link>

        <div className="text-sm text-red-500">
          {error}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* NASLOV */}

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {category?.name}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {dokumenti.length}{" "}
          {dokumenti.length === 1
            ? "dokument"
            : "dokumenata"}
        </p>
      </div>

      {/* DOKUMENTI */}

      {dokumenti.length === 0 ? (
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            px-5
            py-10
            text-center
            text-sm
            text-slate-400
          "
        >
          Nema dokumenata u ovoj kategoriji.
        </div>
      ) : (
        <div className="space-y-2">

          {dokumenti.map((dokument) => (

            <div
              key={dokument.id}
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
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-100
                  "
                >
                  <FileText
                    size={20}
                    className="text-slate-500"
                  />
                </div>

                <div>

                  <div className="font-medium text-slate-900">
                    {dokument.title}
                  </div>

                  <div className="mt-1 text-sm text-slate-400">

                    {new Date(
                      dokument.created
                    ).toLocaleDateString(
                      "sr-Latn-RS",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}

                  </div>

                </div>

              </div>

              {/* OVDE ĆEMO KASNIJE DODATI LINK KA FAJLU */}

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

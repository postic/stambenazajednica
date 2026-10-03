"use client";

import { useEffect, useState } from "react";
import type { Prostor } from "@/types/prostor";

export default function StanariPage() {
  const [prostori, setProstori] = useState<Prostor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProstori() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/prostori?page=1&limit=1000",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Greška pri učitavanju prostora.");
        }

        const json = await response.json();

        if (!ignore) {
          setProstori(json.data ?? []);
        }
      } catch (err) {
        console.error("Greška pri učitavanju stanara:", err);

        if (!ignore) {
          setError("Nije moguće učitati spisak stanara.");
          setProstori([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProstori();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">
            Stanari po prostorima
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled stanara po prostorima
          </p>
        </div>

        <div className="border border-gray-200 bg-white rounded-lg p-6">
          <p className="text-sm text-slate-500">
            Učitavanje...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">
            Stanari po prostorima
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled stanara po prostorima
          </p>
        </div>

        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const ukupnoStanara = prostori.reduce(
    (ukupno, prostor) =>
      ukupno + (prostor.stanari?.length ?? 0),
    0
  );

  return (
    <div className="max-w-5xl">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              Stanari po prostorima
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Pregled stanara po prostorima u zgradi
            </p>
          </div>
        </div>
      </div>

      {/* STATISTIKA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 bg-white rounded-lg p-4">
          <div className="text-sm text-slate-500">
            Prostora
          </div>

          <div className="mt-1 text-2xl font-semibold">
            {prostori.length}
          </div>
        </div>

        <div className="border border-gray-200 bg-white rounded-lg p-4">
          <div className="text-sm text-slate-500">
            Unetih stanara
          </div>

          <div className="mt-1 text-2xl font-semibold">
            {ukupnoStanara}
          </div>
        </div>
      </div>

      {/* SPISAK */}
      {prostori.length === 0 ? (
        <div className="border border-gray-200 bg-white rounded-lg p-6">
          <p className="text-sm text-slate-500">
            Nema pronađenih prostora.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prostori.map((prostor) => {
            const stanari = Array.isArray(prostor.stanari)
              ? prostor.stanari
              : [];

            return (
              <div
                key={prostor.id}
                className="border border-gray-200 bg-white rounded-lg overflow-hidden"
              >
                {/* PROSTOR */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-sm">
                      {prostor.prostor_stan || prostor.title}
                    </h2>

                    {prostor.tip && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {prostor.tip}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    {stanari.length}{" "}
                    {stanari.length === 1
                      ? "stanar"
                      : "stanara"}
                  </div>
                </div>

                {/* STANARI */}
                {stanari.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {stanari.map((stanar, index) => (
                      <div
                        key={`${prostor.id}-${index}`}
                        className="px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                          {index + 1}
                        </div>

                        <div className="text-sm text-slate-800">
                          {stanar}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4">
                    <p className="text-sm text-slate-400">
                      Nema unetih stanara.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

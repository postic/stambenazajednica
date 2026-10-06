"use client";

import { useEffect, useState } from "react";
import type { Prostor } from "@/types/prostor";

export default function PinoviPage() {
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
        console.error("Greška pri učitavanju PIN-ova:", err);

        if (!ignore) {
          setError("Nije moguće učitati PIN-ove.");
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
            PIN-ovi
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled PIN-ova po prostorima
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
            PIN-ovi
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled PIN-ova po prostorima
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

  return (
    <div className="max-w-5xl">
      {/* HEADER */}
      <div className="mb-6">
        <div>
          <h1 className="text-xl font-semibold">
            PIN-ovi
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled PIN-ova po prostorima u zgradi
          </p>
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
            PIN-ova
          </div>

          <div className="mt-1 text-2xl font-semibold">
            {
              prostori.filter(
                (prostor) => prostor.pin
              ).length
            }
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
        <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200">
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Prostor
            </div>

            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              PIN
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {prostori.map((prostor) => (
              <div
                key={prostor.id}
                className="grid grid-cols-2"
              >
                {/* PROSTOR */}
                <div className="px-4 py-3">
                  <div className="text-sm font-medium text-slate-800">
                    {prostor.prostor_stan || prostor.title}
                  </div>

                  {prostor.tip && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {prostor.tip}
                    </div>
                  )}
                </div>

                {/* PIN */}
                <div className="px-4 py-3">
                  {prostor.pin ? (
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 font-mono text-sm font-semibold text-slate-800">
                      {prostor.pin}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">
                      Nema PIN-a
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

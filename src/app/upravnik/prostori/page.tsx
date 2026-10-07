"use client";

import { useEffect, useState } from "react";
import type { Prostor } from "@/types/prostor";

export default function ProstoriPage() {
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
        console.error("Greška pri učitavanju prostora:", err);

        if (!ignore) {
          setError("Nije moguće učitati spisak prostora.");
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
            Prostori
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled svih prostora u zgradi
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
            Prostori
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled svih prostora u zgradi
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
      ukupno + (Number(prostor.broj_stanara) || 0),
    0
  );

  const ukupnaKvadratura = prostori.reduce(
    (ukupno, prostor) =>
      ukupno + (Number(prostor.kvadratura) || 0),
    0
  );

  return (
    <div className="max-w-5xl">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Prostori
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Pregled svih prostora u zgradi
        </p>
      </div>

      {/* STATISTIKA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
            Stanara
          </div>

          <div className="mt-1 text-2xl font-semibold">
            {ukupnoStanara}
          </div>
        </div>

        <div className="border border-gray-200 bg-white rounded-lg p-4">
          <div className="text-sm text-slate-500">
            Ukupna kvadratura
          </div>

          <div className="mt-1 text-2xl font-semibold">
            {ukupnaKvadratura.toLocaleString("sr-RS")} m²
          </div>
        </div>
      </div>

      {/* SPISAK PROSTORA */}
      {prostori.length === 0 ? (
        <div className="border border-gray-200 bg-white rounded-lg p-6">
          <p className="text-sm text-slate-500">
            Nema pronađenih prostora.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prostori.map((prostor) => (
            <div
              key={prostor.id}
              className="border border-gray-200 bg-white rounded-lg overflow-hidden"
            >
              {/* NASLOV PROSTORA */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">
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

                  {/* DIREKTNO broj_stanara */}
                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    {prostor.broj_stanara ?? 0}{" "}
                    {Number(prostor.broj_stanara) === 1
                      ? "stanar"
                      : "stanara"}
                  </div>
                </div>
              </div>

              {/* PODACI O PROSTORU */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-4">
                {/* SPRAT */}
                <div>
                  <div className="text-xs text-slate-500">
                    Sprat
                  </div>

                  <div className="mt-1 text-sm text-slate-800">
                    {prostor.sprat || "—"}
                  </div>
                </div>

                {/* KVADRATURA */}
                <div>
                  <div className="text-xs text-slate-500">
                    Kvadratura
                  </div>

                  <div className="mt-1 text-sm text-slate-800">
                    {prostor.kvadratura
                      ? `${prostor.kvadratura} m²`
                      : "—"}
                  </div>
                </div>

                {/* VLASNIK */}
                <div>
                  <div className="text-xs text-slate-500">
                    Vlasnik
                  </div>

                  <div className="mt-1 text-sm text-slate-800">
                    {prostor.vlasnik || "—"}
                  </div>
                </div>

                {/* BROJ STANARA */}
                <div>
                  <div className="text-xs text-slate-500">
                    Broj stanara
                  </div>

                  <div className="mt-1 text-sm text-slate-800">
                    {prostor.broj_stanara ?? 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

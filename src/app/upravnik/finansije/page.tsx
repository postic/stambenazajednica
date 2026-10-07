"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import type { Transakcija } from "@/types/transakcija";

export default function FinansijePage() {
  const [transakcije, setTransakcije] = useState<Transakcija[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransakcije() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          "/api/transakcije?page=1&limit=10000",
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Greška pri učitavanju transakcija.");
        }

        const json = await res.json();

        setTransakcije(
          Array.isArray(json.data) ? json.data : []
        );
      } catch (err) {
        console.error(
          "Greška pri učitavanju transakcija:",
          err
        );

        setError(
          "Nije moguće učitati finansijske podatke."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransakcije();
  }, []);

  const finansije = useMemo(() => {
    let prihodi = 0;
    let rashodi = 0;

    for (const transakcija of transakcije) {
      const amount = Number(transakcija.amount || 0);

      if (!Number.isFinite(amount)) {
        continue;
      }

      if (transakcija.type === "uplata") {
        prihodi += Math.abs(amount);
      }

      if (transakcija.type === "isplata") {
        rashodi += Math.abs(amount);
      }
    }

    return {
      prihodi,
      rashodi,
      stanje: prihodi - rashodi,
    };
  }, [transakcije]);

  function formatMoney(value: number) {
    return (
      new Intl.NumberFormat("sr-RS", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " €"
    );
  }

  function formatDate(date: string) {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(parsed);
  }

  return (
    <div className="max-w-6xl">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Finansije
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Pregled finansijskog stanja i svih transakcija
          stambene zajednice
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FINANSIJSKE KARTICE */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* STANJE */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Trenutno stanje
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  finansije.stanje >= 0
                    ? "text-gray-900"
                    : "text-red-600"
                }`}
              >
                {loading
                  ? "Učitavanje..."
                  : formatMoney(finansije.stanje)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Wallet className="h-6 w-6 text-gray-700" />
            </div>
          </div>
        </div>

        {/* PRIHODI */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Prihodi
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {loading
                  ? "Učitavanje..."
                  : formatMoney(finansije.prihodi)}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-3">
              <ArrowUpCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* RASHODI */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Rashodi
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {loading
                  ? "Učitavanje..."
                  : formatMoney(finansije.rashodi)}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <ArrowDownCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SVE TRANSAKCIJE */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Sve transakcije
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Ukupno: {transakcije.length} transakcija
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Učitavanje transakcija...
          </div>
        ) : transakcije.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Nema evidentiranih transakcija.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-5 py-3 font-medium text-gray-600">
                    Datum
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-600">
                    Transakcija
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-600">
                    Tip
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-gray-600">
                    Iznos
                  </th>
                </tr>
              </thead>

              <tbody>
                {transakcije.map((transakcija) => {
                  const isUplata =
                    transakcija.type === "uplata";

                  return (
                    <tr
                      key={transakcija.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      {/* DATUM */}
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {formatDate(transakcija.created)}
                      </td>

                      {/* NAZIV */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {transakcija.title || "Bez naziva"}
                        </div>

                        {transakcija.body && (
                          <div
                            className="mt-1 max-w-xl truncate text-xs text-gray-500"
                            dangerouslySetInnerHTML={{
                              __html: transakcija.body,
                            }}
                          />
                        )}
                      </td>

                      {/* TIP */}
                      <td className="px-5 py-4">
                        {isUplata ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <ArrowUpCircle className="h-3.5 w-3.5" />
                            Uplata
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            <ArrowDownCircle className="h-3.5 w-3.5" />
                            Isplata
                          </span>
                        )}
                      </td>

                      {/* IZNOS */}
                      <td
                        className={`whitespace-nowrap px-5 py-4 text-right font-semibold ${
                          isUplata
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isUplata ? "+" : "-"}
                        {formatMoney(
                          Math.abs(
                            Number(transakcija.amount || 0)
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

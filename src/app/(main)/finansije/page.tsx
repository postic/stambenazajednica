"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";

type Transakcija = {
  id: string;
  title: string;
  body?: string;
  created: string;
  type?: string;
  amount: number;
  balance?: number;
};

type Period = "6" | "12" | "all";

type MonthlyData = {
  key: string;
  label: string;
  prihod: number;
  rashod: number;
  neto: number;
  balance: number;
};

function isPrihod(type?: string) {
  const value = String(type || "").toLowerCase().trim();

  return (
    value.includes("prihod") ||
    value.includes("uplata") ||
    value.includes("priliv") ||
    value === "income" ||
    value === "in"
  );
}

function isRashod(type?: string) {
  const value = String(type || "").toLowerCase().trim();

  return (
    value.includes("rashod") ||
    value.includes("isplata") ||
    value.includes("odliv") ||
    value === "expense" ||
    value === "out"
  );
}

function formatRsd(value: number) {
  return new Intl.NumberFormat("sr-RS", {
    maximumFractionDigits: 0,
  }).format(value) + " RSD";
}

function formatShortRsd(value: number) {
  return new Intl.NumberFormat("sr-RS", {
    maximumFractionDigits: 0,
  }).format(value);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("sr-Latn-RS", {
    month: "short",
  }).format(date);
}

export default function FinansijePage() {
  const [transakcije, setTransakcije] = useState<Transakcija[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("12");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "/api/transakcije?sort=-created&page=1&limit=10000",
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Greška pri učitavanju transakcija");
        }

        const json = await res.json();

        setTransakcije(json.data || []);
      } catch (error) {
        console.error("Greška pri učitavanju finansija:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (period === "all") {
      return transakcije;
    }

    const months = Number(period);

    const limitDate = new Date();
    limitDate.setMonth(limitDate.getMonth() - months);

    return transakcije.filter((transaction) => {
      const date = new Date(transaction.created);

      return date >= limitDate;
    });
  }, [transakcije, period]);

  const stats = useMemo(() => {
    let prihod = 0;
    let rashod = 0;

    filteredTransactions.forEach((transaction) => {
      const amount = Math.abs(Number(transaction.amount || 0));

      if (isPrihod(transaction.type)) {
        prihod += amount;
      } else if (isRashod(transaction.type)) {
        rashod += amount;
      }
    });

    return {
      prihod,
      rashod,
      neto: prihod - rashod,
    };
  }, [filteredTransactions]);

  /*
   * Trenutno stanje računamo iz svih transakcija,
   * a ne samo iz izabranog perioda.
   */
  const currentBalance = useMemo(() => {
    let balance = 0;

    const sorted = [...transakcije].sort(
      (a, b) =>
        new Date(a.created).getTime() -
        new Date(b.created).getTime()
    );

    sorted.forEach((transaction) => {
      const amount = Math.abs(Number(transaction.amount || 0));

      if (isPrihod(transaction.type)) {
        balance += amount;
      } else if (isRashod(transaction.type)) {
        balance -= amount;
      }
    });

    return balance;
  }, [transakcije]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, MonthlyData>();

    const sorted = [...filteredTransactions].sort(
      (a, b) =>
        new Date(a.created).getTime() -
        new Date(b.created).getTime()
    );

    let runningBalance = currentBalance;

    /*
     * Za prikaz istorije računamo stanje unazad.
     * Krećemo od trenutnog stanja i vraćamo transakcije.
     */
    const balances = new Map<string, number>();

    for (let i = sorted.length - 1; i >= 0; i--) {
      const transaction = sorted[i];
      const key = monthKey(new Date(transaction.created));

      balances.set(key, runningBalance);

      const amount = Math.abs(Number(transaction.amount || 0));

      if (isPrihod(transaction.type)) {
        runningBalance -= amount;
      } else if (isRashod(transaction.type)) {
        runningBalance += amount;
      }
    }

    sorted.forEach((transaction) => {
      const date = new Date(transaction.created);
      const key = monthKey(date);

      if (!map.has(key)) {
        map.set(key, {
          key,
          label: monthLabel(date),
          prihod: 0,
          rashod: 0,
          neto: 0,
          balance: balances.get(key) ?? 0,
        });
      }

      const item = map.get(key)!;
      const amount = Math.abs(Number(transaction.amount || 0));

      if (isPrihod(transaction.type)) {
        item.prihod += amount;
      } else if (isRashod(transaction.type)) {
        item.rashod += amount;
      }

      item.neto = item.prihod - item.rashod;
    });

    return Array.from(map.values());
  }, [filteredTransactions, currentBalance]);

  const maxMonthlyValue = useMemo(() => {
    return Math.max(
      ...monthlyData.flatMap((item) => [
        item.prihod,
        item.rashod,
      ]),
      1
    );
  }, [monthlyData]);

  const balanceChart = useMemo(() => {
    if (!monthlyData.length) {
      return [];
    }

    return monthlyData.map((item) => ({
      ...item,
      height:
        currentBalance > 0
          ? Math.max(8, (item.balance / Math.max(currentBalance, 1)) * 100)
          : 8,
    }));
  }, [monthlyData, currentBalance]);

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Finansije</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pregled finansijskog stanja stambene zajednice
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border bg-white"
            />
          ))}
        </div>

        <div className="mt-6 h-80 animate-pulse rounded-xl border bg-white" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl pb-10">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Finansije</h1>

          <p className="mt-1 text-sm text-slate-500">
            Pregled prihoda, rashoda i stanja računa stambene zajednice
          </p>
        </div>
      </div>

      {/* PERIOD */}
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { value: "6" as Period, label: "6 meseci" },
          { value: "12" as Period, label: "12 meseci" },
          { value: "all" as Period, label: "Sve" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setPeriod(item.value)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              period === item.value
                ? "border-primary bg-primary text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* STANJE */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Wallet className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Trenutno stanje
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {formatRsd(currentBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* PRIHOD */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <ArrowUp className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Prihodi
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {formatRsd(stats.prihod)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Izabrani period
              </p>
            </div>
          </div>
        </div>

        {/* RASHOD */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <ArrowDown className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Rashodi
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {formatRsd(stats.rashod)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Izabrani period
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NETO */}
      <div className="mt-4 rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Neto promena
            </p>

            <p
              className={`mt-1 text-2xl font-semibold ${
                stats.neto >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {stats.neto >= 0 ? "+" : ""}
              {formatRsd(stats.neto)}
            </p>
          </div>

          <p className="text-right text-xs text-slate-400">
            {period === "all"
              ? "Sve transakcije"
              : `Poslednjih ${period} meseci`}
          </p>
        </div>
      </div>

      {/* BALANCE CHART */}
      <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold">
            Kretanje stanja
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pregled stanja računa kroz izabrani period
          </p>
        </div>

        {balanceChart.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Nema dovoljno podataka za prikaz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex h-64 min-w-[600px] items-end gap-3 border-b border-slate-200 px-2 pb-0">
              {balanceChart.map((item) => (
                <div
                  key={item.key}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div className="mb-2 text-center text-[11px] text-slate-500">
                    {formatShortRsd(item.balance)}
                  </div>

                  <div className="flex flex-1 items-end justify-center">
                    <div
                      className="w-full max-w-14 rounded-t-md bg-primary/80 transition-all"
                      style={{
                        height: `${Math.min(
                          Math.max(item.height, 8),
                          100
                        )}%`,
                      }}
                      title={`${item.label}: ${formatRsd(
                        item.balance
                      )}`}
                    />
                  </div>

                  <div className="mt-2 text-center text-xs text-slate-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INCOME / EXPENSE CHART */}
      <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold">
            Prihodi i rashodi
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Mesečni pregled priliva i troškova
          </p>
        </div>

        {monthlyData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Nema transakcija za izabrani period.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="flex h-72 min-w-[600px] items-end gap-3 border-b border-slate-200 px-2">
                {monthlyData.map((item) => {
                  const prihodHeight =
                    (item.prihod / maxMonthlyValue) * 100;

                  const rashodHeight =
                    (item.rashod / maxMonthlyValue) * 100;

                  return (
                    <div
                      key={item.key}
                      className="flex h-full flex-1 items-end justify-center gap-1"
                    >
                      <div className="flex h-full flex-1 flex-col justify-end">
                        <div
                          className="w-full rounded-t bg-primary/80"
                          style={{
                            height: `${Math.max(
                              prihodHeight,
                              item.prihod > 0 ? 3 : 0
                            )}%`,
                          }}
                          title={`Prihod: ${formatRsd(
                            item.prihod
                          )}`}
                        />
                      </div>

                      <div className="flex h-full flex-1 flex-col justify-end">
                        <div
                          className="w-full rounded-t bg-slate-300"
                          style={{
                            height: `${Math.max(
                              rashodHeight,
                              item.rashod > 0 ? 3 : 0
                            )}%`,
                          }}
                          title={`Rashod: ${formatRsd(
                            item.rashod
                          )}`}
                        />
                      </div>

                      <div className="absolute mt-[310px] text-xs text-slate-500">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-primary/80" />
                Prihodi
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-slate-300" />
                Rashodi
              </div>
            </div>
          </>
        )}
      </div>

      {/* SUMMARY TABLE */}
      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Mesečni pregled
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-5 py-3 font-medium text-slate-600">
                  Mesec
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-600">
                  Prihodi
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-600">
                  Rashodi
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-600">
                  Neto
                </th>
              </tr>
            </thead>

            <tbody>
              {monthlyData
                .slice()
                .reverse()
                .map((item) => (
                  <tr
                    key={item.key}
                    className="border-b last:border-0"
                  >
                    <td className="px-5 py-3 font-medium">
                      {item.label}
                    </td>

                    <td className="px-5 py-3 text-right">
                      {formatRsd(item.prihod)}
                    </td>

                    <td className="px-5 py-3 text-right">
                      {formatRsd(item.rashod)}
                    </td>

                    <td
                      className={`px-5 py-3 text-right font-medium ${
                        item.neto >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.neto >= 0 ? "+" : ""}
                      {formatRsd(item.neto)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

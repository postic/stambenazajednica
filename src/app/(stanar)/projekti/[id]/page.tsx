import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CalendarCheck2,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
} from "lucide-react";

import { isEmptyHtml } from "@/lib/text";
import StatusBadge from "@/components/StatusBadge";

import type { ProjekatDetalj } from "@/types/projekat";

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

type ProjekatTransakcija = {
  id: string;
  title: string;
  body: string;
  created: string;
  type: string;
  amount: number;
};

type ProjekatData = {
  projekat: ProjekatDetalj;
  transakcije: ProjekatTransakcija[];
};

async function getProjekat(
  id: string
): Promise<ProjekatData | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/projekat/${id}?include=field_projekat_transakcija`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    const item = data?.data;

    if (!item) {
      return null;
    }

    const relationshipData =
      item?.relationships
        ?.field_projekat_transakcija
        ?.data;

    let relationshipList: any[] = [];

    if (Array.isArray(relationshipData)) {
      relationshipList = relationshipData;
    } else if (
      relationshipData &&
      typeof relationshipData === "object"
    ) {
      relationshipList = [
        relationshipData,
      ];
    }

    const included = Array.isArray(
      data?.included
    )
      ? data.included
      : [];

    const transakcije: ProjekatTransakcija[] =
      [];

    for (
      const relation of relationshipList
    ) {
      if (!relation?.id) {
        continue;
      }

      const transaction =
        included.find(
          (includedItem: any) =>
            includedItem?.type ===
              "node--transakcija" &&
            includedItem?.id ===
              relation.id
        );

      if (!transaction) {
        continue;
      }

      const attributes =
        transaction.attributes ?? {};

      const rawType =
        attributes.field_tip;

      const type =
        typeof rawType === "string"
          ? rawType
          : rawType?.value ?? "";

      const amount = Number(
        attributes.field_iznos ?? 0
      );

      transakcije.push({
        id: transaction.id,

        title:
          attributes.title ?? "",

        body:
          attributes.body?.value ?? "",

        created:
          attributes.created ?? "",

        type,

        amount: Number.isNaN(amount)
          ? 0
          : amount,
      });
    }

    const projekat: ProjekatDetalj = {
      id: item.id,

      title:
        item.attributes?.title ?? "",

      body:
        item.attributes?.body?.value ?? "",

      created:
        item.attributes?.created ?? "",

      changed:
        item.attributes?.changed ?? "",

      status:
        item.attributes
          ?.field_projekat_status ?? "",

      datumPocetka:
        item.attributes
          ?.field_projekat_datum_pocetka ?? "",

      datumZavrsetka:
        item.attributes
          ?.field_projekat_datum_zavrsetka ?? "",
    };

    return {
      projekat,
      transakcije,
    };
  } catch (error) {
    console.error(
      "Greška pri učitavanju projekta:",
      error
    );

    return null;
  }
}

function formatDate(
  dateString: string
) {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    dateString
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateString;
  }

  return date.toLocaleDateString(
    "sr-Latn-RS",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatAmount(
  amount: number
) {
  return new Intl.NumberFormat(
    "sr-RS",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(
    Math.abs(amount)
  );
}

function isIncome(
  type: string
) {
  const normalized =
    type
      .toLowerCase()
      .trim();

  return [
    "prihod",
    "uplata",
    "priliv",
    "income",
  ].includes(
    normalized
  );
}

function getTransactionTypeLabel(
  type: string
) {
  const normalized =
    type
      .toLowerCase()
      .trim();

  if (
    [
      "prihod",
      "uplata",
      "priliv",
    ].includes(normalized)
  ) {
    return "Prihod";
  }

  if (
    [
      "rashod",
      "isplata",
      "odliv",
    ].includes(normalized)
  ) {
    return "Rashod";
  }

  if (
    normalized ===
    "income"
  ) {
    return "Prihod";
  }

  if (
    normalized ===
    "expense"
  ) {
    return "Rashod";
  }

  return type;
}

interface PageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function ProjekatPage({
  params,
}: PageProps) {
  const { id } =
    await params;

  const data =
    await getProjekat(id);

  if (!data) {
    notFound();
  }

  const {
    projekat,
    transakcije,
  } = data;

  return (
    <div className="max-w-4xl">

      {/* NASLOV */}

      <div className="mb-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <h1 className="text-xl font-semibold">
              {projekat.title}
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              {projekat.created &&
                formatDate(
                  projekat.created
                )}
            </p>

          </div>

          <div>
            {projekat.status && (
              <StatusBadge
                status={
                  projekat.status
                }
              />
            )}
          </div>

        </div>

      </div>

      {/* DATUMI PROJEKTA */}

      {(
        projekat.datumPocetka ||
        projekat.datumZavrsetka
      ) && (
        <div className="border border-gray-300 bg-slate-50 p-4 mb-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {projekat.datumPocetka && (
              <div className="flex items-center gap-3">

                <CalendarDays
                  className="h-5 w-5 shrink-0 text-gray-400"
                />

                <div>

                  <div className="text-xs text-gray-400 mb-1">
                    Datum početka
                  </div>

                  <div className="text-sm font-medium text-gray-700">
                    {formatDate(
                      projekat.datumPocetka
                    )}
                  </div>

                </div>

              </div>
            )}

            {projekat.datumZavrsetka && (
              <div className="flex items-center gap-3">

                <CalendarCheck2
                  className="h-5 w-5 shrink-0 text-gray-400"
                />

                <div>

                  <div className="text-xs text-gray-400 mb-1">
                    Datum završetka
                  </div>

                  <div className="text-sm font-medium text-gray-700">
                    {formatDate(
                      projekat.datumZavrsetka
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* TRANSAKCIJE PROJEKTA */}

      {transakcije.length > 0 && (
        <div className="mb-6">

          <div className="border border-gray-300 bg-slate-50 mb-6">

            {transakcije.map(
              (
                transakcija,
                index
              ) => {

                const income =
                  isIncome(
                    transakcija.type
                  );

                return (
                  <Link
                    key={
                      transakcija.id
                    }
                    href={`/transakcije/${transakcija.id}`}
                    className={
                      `block p-4 hover:bg-slate-50 transition ${
                        index > 0
                          ? "border-t border-gray-200"
                          : ""
                      }`
                    }
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-start gap-3 min-w-0">

                        {income ? (
                          <ArrowUpCircle
                            className="h-5 w-5 shrink-0 text-gray-500 mt-0.5"
                          />
                        ) : (
                          <ArrowDownCircle
                            className="h-5 w-5 shrink-0 text-gray-500 mt-0.5"
                          />
                        )}

                        <div className="min-w-0">

                          <div className="text-sm font-medium text-gray-700">
                            {transakcija.title}
                          </div>

                          <div className="text-xs text-gray-400 mt-1">

                            {formatDate(
                              transakcija.created
                            )}

                            {transakcija.type && (
                              <>
                                {" · "}
                                {getTransactionTypeLabel(
                                  transakcija.type
                                )}
                              </>
                            )}

                          </div>

                          {!isEmptyHtml(
                            transakcija.body
                          ) && (
                            <div
                              className="text-sm text-gray-600 mt-2 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html:
                                  transakcija.body,
                              }}
                            />
                          )}

                        </div>

                      </div>

                      <div
                        className={
                          `shrink-0 text-sm font-medium ${
                            income
                              ? "text-green-700"
                              : "text-red-700"
                          }`
                        }
                      >
                        {income
                          ? "+"
                          : "-"}{" "}
                        {formatAmount(
                          transakcija.amount
                        )}{" "}
                        RSD
                      </div>

                    </div>

                  </Link>
                );
              }
            )}

          </div>

        </div>
      )}

      {/* OPIS PROJEKTA */}

      {!isEmptyHtml(
        projekat.body
      ) && (
        <div className="border border-gray-300 bg-slate-50 p-4 mb-6">

          <div
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                projekat.body,
            }}
          />

        </div>
      )}

    </div>
  );
}

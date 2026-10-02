import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";

import { isEmptyHtml } from "@/lib/text";
import StatusBadge from "@/components/StatusBadge";

import type { ProjekatDetalj } from "@/types/projekat";

const BASE_URL =
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

type ProjekatPonuda = {
  id: string;
  title: string;
  created: string;
  amount: number;
  body: string;
  izabrana: boolean;
};

type ProjekatDokument = {
  id: string;
  naziv: string;
  url: string;
  description?: string;
};

type ProjekatData = {
  projekat: ProjekatDetalj;
  transakcije: ProjekatTransakcija[];
  ponude: ProjekatPonuda[];
};

function getTextValue(value: any): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (
    value &&
    typeof value === "object"
  ) {
    if (typeof value.value === "string") {
      return value.value.trim();
    }

    if (typeof value.text === "string") {
      return value.text.trim();
    }

    if (typeof value.description === "string") {
      return value.description.trim();
    }
  }

  return "";
}

function getDocumentDescription(
  relation: any,
  file: any
): string {
  const relationAttributes =
    relation?.attributes ?? {};

  const fileAttributes =
    file?.attributes ?? {};

  const possibleDescriptions = [
    relationAttributes.description,
    relationAttributes.field_description,
    relationAttributes.field_opis,
    relationAttributes.field_file_description,
    relationAttributes.label,

    relation?.meta?.description,
    relation?.meta?.label,

    fileAttributes.description,
    fileAttributes.field_description,
    fileAttributes.field_opis,
    fileAttributes.field_file_description,
  ];

  for (const value of possibleDescriptions) {
    const text = getTextValue(value);

    if (text) {
      return text;
    }
  }

  return "Dokument";
}

async function getProjekat(
  id: string
): Promise<ProjekatData | null> {
  try {
    /*
     * PROJEKAT
     */

    const res = await fetch(
      `${BASE_URL}/jsonapi/node/projekat/${id}?include=field_projekat_transakcija,field_projekat_izvestaj`,
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

    /*
     * INCLUDED
     */

    const included = Array.isArray(data?.included)
      ? data.included
      : [];

    /*
     * IZVEŠTAJI / DOKUMENTI
     */

    const izvestajRelations =
      item?.relationships?.field_projekat_izvestaj?.data;

    const izvestajList = Array.isArray(
      izvestajRelations
    )
      ? izvestajRelations
      : izvestajRelations
        ? [izvestajRelations]
        : [];

    const izvestaji: ProjekatDokument[] = [];

    for (const relation of izvestajList) {
      if (!relation?.id) {
        continue;
      }

      const file = included.find(
        (includedItem: any) =>
          includedItem?.type === "file--file" &&
          includedItem?.id === relation.id
      );

      if (!file) {
        continue;
      }

      const attributes =
        file.attributes ?? {};

      /*
       * URL DOKUMENTA
       */

      let url =
        attributes?.uri?.url ||
        attributes?.uri?.value ||
        attributes?.url ||
        "";

      if (!url) {
        continue;
      }

      if (url.startsWith("/")) {
        url = `${BASE_URL}${url}`;
      }

      /*
       * OPIS DOKUMENTA
       *
       * Ne koristimo filename.
       */

      const naziv =
        getDocumentDescription(
          relation,
          file
        );

      izvestaji.push({
        id: file.id,
        naziv,
        url,
      });
    }

    /*
     * TRANSAKCIJE
     */

    const relationshipData =
      item?.relationships
        ?.field_projekat_transakcija
        ?.data;

    let relationshipList: any[] = [];

    if (Array.isArray(relationshipData)) {
      relationshipList =
        relationshipData;
    } else if (
      relationshipData &&
      typeof relationshipData === "object"
    ) {
      relationshipList = [
        relationshipData,
      ];
    }

    const transakcije: ProjekatTransakcija[] =
      [];

    for (const relation of relationshipList) {
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
        amount:
          Number.isNaN(amount)
            ? 0
            : amount,
      });
    }

    /*
     * PONUDE
     */

    let ponude: ProjekatPonuda[] = [];

    try {
      const ponudeRes =
        await fetch(
          `${BASE_URL}/jsonapi/node/ponuda?filter[field_ponuda_projekat.id]=${encodeURIComponent(
            id
          )}&sort=created&page[limit]=100`,
          {
            headers: {
              Accept:
                "application/vnd.api+json",
            },
            cache: "no-store",
          }
        );

      if (ponudeRes.ok) {
        const ponudeData =
          await ponudeRes.json();

        const ponudeItems =
          Array.isArray(
            ponudeData?.data
          )
            ? ponudeData.data
            : [];

        ponude =
          ponudeItems.map(
            (ponuda: any) => {
              const attributes =
                ponuda.attributes ??
                {};

              const amount =
                Number(
                  attributes.field_iznos ??
                    0
                );

              const rawIzabrana =
                attributes.field_ponuda_izabrana;

              const izabrana =
                rawIzabrana === true ||
                rawIzabrana === 1 ||
                rawIzabrana === "1" ||
                rawIzabrana === "true";

              return {
                id: ponuda.id,
                title:
                  attributes.title ??
                  "",
                created:
                  attributes.created ??
                  "",
                amount:
                  Number.isNaN(
                    amount
                  )
                    ? 0
                    : amount,
                body:
                  attributes.body
                    ?.value ?? "",
                izabrana,
              };
            }
          );
      }
    } catch (error) {
      console.error(
        "Greška pri učitavanju ponuda:",
        error
      );
    }

    /*
     * PROJEKAT
     */

    const projekat: ProjekatDetalj = {
      id: item.id,

      title:
        item.attributes?.title ??
        "",

      body:
        item.attributes?.body
          ?.value ?? "",

      created:
        item.attributes?.created ??
        "",

      changed:
        item.attributes?.changed ??
        "",

      status:
        item.attributes
          ?.field_projekat_status ??
        "",

      datumPocetka:
        item.attributes
          ?.field_projekat_datum_pocetka ??
        "",

      datumZavrsetka:
        item.attributes
          ?.field_projekat_datum_zavrsetka ??
        "",

      izvestaji,
    };

    return {
      projekat,
      transakcije,
      ponude,
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
    normalized === "income"
  ) {
    return "Prihod";
  }

  if (
    normalized === "expense"
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
    ponude,
  } = data;

  return (
    <div className="max-w-4xl">

      {/* HEADER */}

      <div className="mb-6">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <h1 className="text-xl font-semibold">
              {projekat.title}
            </h1>

            {projekat.created && (
              <p className="text-sm text-gray-400 mt-1">
                {formatDate(
                  projekat.created
                )}
              </p>
            )}

          </div>

          {projekat.status && (
            <StatusBadge
              status={
                projekat.status
              }
            />
          )}

        </div>

      </div>

      {/* DATUMI */}

      <div className="border border-gray-300 bg-gray-50 p-3 mb-6">

        <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
          Datumi projekta
        </h3>

        <div className="text-sm">

          <div className="border-b border-gray-200 py-2">

            <p className="text-xs text-gray-500">
              Datum početka
            </p>

            <p className="leading-7">
              {projekat.datumPocetka
                ? formatDate(
                    projekat.datumPocetka
                  )
                : "-"}
            </p>

          </div>

          <div className="py-2">

            <p className="text-xs text-gray-500">
              Datum završetka
            </p>

            <p className="leading-7">
              {projekat.datumZavrsetka
                ? formatDate(
                    projekat.datumZavrsetka
                  )
                : "-"}
            </p>

          </div>

        </div>

      </div>

      {/* PONUDE */}

      {ponude.length > 0 && (
        <div className="border border-gray-300 bg-gray-50 p-3 mb-6">

          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Ponude
            <span className="font-normal text-gray-400 ml-1">
              ({ponude.length})
            </span>
          </h3>

          <div className="text-sm">

            {ponude.map(
              (ponuda) => (
                <Link
                  key={
                    ponuda.id
                  }
                  href={`/ponude/${ponuda.id}`}
                  className="block border-b last:border-b-0 border-gray-200 py-3 hover:bg-white transition"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="min-w-0">

                      <div className="font-medium text-gray-700 truncate">
                        {ponuda.title}
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(
                          ponuda.created
                        )}
                      </div>

                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1 text-sm">

                      {ponuda.izabrana && (
                        <span className="inline-flex items-center gap-1 font-medium text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Izabrana
                        </span>
                      )}

                      {ponuda.amount > 0 && (
                        <span className="font-medium text-gray-700">
                          {formatAmount(
                            ponuda.amount
                          )}{" "}
                          RSD
                        </span>
                      )}

                    </div>

                  </div>

                </Link>
              )
            )}

          </div>

        </div>
      )}

      {/* TRANSAKCIJE */}

      {transakcije.length > 0 && (
        <div className="border border-gray-300 bg-gray-50 p-3 mb-6">

          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Transakcije
            <span className="font-normal text-gray-400 ml-1">
              ({transakcije.length})
            </span>
          </h3>

          <div className="text-sm">

            {transakcije.map(
              (transakcija) => {

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
                    className="block border-b last:border-b-0 border-gray-200 py-3 hover:bg-white transition"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">

                        <div className="font-medium text-gray-700 truncate">
                          {transakcija.title}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">

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

                      </div>

                      <div
                        className={`shrink-0 font-medium ${
                          income
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
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

      {/* DOKUMENTI */}

      <div className="border border-gray-300 bg-gray-50 p-3 mb-6">

        <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
          Dokumenti
          <span className="font-normal text-gray-400 ml-1">
            ({projekat.izvestaji.length})
          </span>
        </h3>

        {projekat.izvestaji.length > 0 ? (
          <div className="text-sm">

            {projekat.izvestaji.map(
              (dokument) => (
                <a
                  key={dokument.id}
                  href={dokument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-b last:border-b-0 border-gray-200 py-2 text-gray-700 hover:text-gray-900 hover:underline"
                >
                  <FileText className="h-4 w-4 shrink-0 text-gray-500" />

                  <span>
                    {dokument.naziv}
                  </span>
                </a>
              )
            )}

          </div>
        ) : (
          <p className="text-sm leading-7 text-gray-500">
            -
          </p>
        )}

      </div>

      {/* OPIS */}

      {!isEmptyHtml(
        projekat.body
      ) && (
        <div className="border border-gray-300 bg-white p-4 text-sm leading-relaxed">

          <h3 className="text-sm font-semibold mb-3 border-b border-gray-300 pb-1">
            Opis projekta
          </h3>

          <div
            dangerouslySetInnerHTML={{
              __html: projekat.body ?? "",
            }}
          />

        </div>
      )}

    </div>
  );
}

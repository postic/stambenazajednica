import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

type Dokument = {
  id: string;
  naziv: string;
  url: string;
};

type Ponuda = {
  id: string;
  title: string;
  amount: number;
  izabrana: boolean;
  projekatId: string | null;
  projekatTitle: string;
  dokumenti: Dokument[];
};

async function getPonuda(id: string): Promise<Ponuda | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/jsonapi/node/ponuda/${id}?include=field_ponuda_projekat,field_ponuda_dokument`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const item = data?.data;

    if (!item) return null;

    const attributes = item.attributes ?? {};
    const relationships = item.relationships ?? {};
    const included = Array.isArray(data?.included)
      ? data.included
      : [];

    // ---------------------------------------------------------
    // PROJEKAT
    // ---------------------------------------------------------

    const projekatRel =
      relationships?.field_ponuda_projekat?.data;

    let projekatId: string | null = null;
    let projekatTitle = "";

    if (projekatRel?.id) {
      projekatId = projekatRel.id;

      const projekat = included.find(
        (includedItem: any) =>
          includedItem?.type === "node--projekat" &&
          includedItem?.id === projekatRel.id
      );

      if (projekat) {
        projekatTitle =
          projekat.attributes?.title ?? "";
      }
    }

    // ---------------------------------------------------------
    // DOKUMENTI
    // ---------------------------------------------------------

    const dokumentData =
      relationships?.field_ponuda_dokument?.data;

    const dokumentRelations = Array.isArray(dokumentData)
      ? dokumentData
      : dokumentData
        ? [dokumentData]
        : [];

    const dokumenti: Dokument[] = [];

    for (const dokumentRel of dokumentRelations) {
      if (!dokumentRel?.id) continue;

      const dokument = included.find(
        (includedItem: any) =>
          includedItem?.type === "file--file" &&
          includedItem?.id === dokumentRel.id
      );

      if (!dokument) continue;

      const dokumentAttributes =
        dokument.attributes ?? {};

      const naziv =
        dokumentAttributes.filename ||
        "Dokument";

      const relativeUrl =
        dokumentAttributes.uri?.url ?? null;

      if (!relativeUrl) continue;

      const url = relativeUrl.startsWith("http")
        ? relativeUrl
        : `${BASE_URL}${relativeUrl}`;

      dokumenti.push({
        id: dokument.id,
        naziv,
        url,
      });
    }

    // ---------------------------------------------------------
    // OSTALO
    // ---------------------------------------------------------

    const amount = Number(
      attributes.field_ponuda_iznos ?? 0
    );

    const rawIzabrana =
      attributes.field_ponuda_izabrana;

    const izabrana =
      rawIzabrana === true ||
      rawIzabrana === 1 ||
      rawIzabrana === "1" ||
      rawIzabrana === "true";

    return {
      id: item.id,
      title: attributes.title ?? "",
      amount: Number.isNaN(amount) ? 0 : amount,
      izabrana,
      projekatId,
      projekatTitle,
      dokumenti,
    };
  } catch (error) {
    console.error(
      "Greška pri učitavanju ponude:",
      error
    );

    return null;
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PonudaPage({
  params,
}: PageProps) {
  const { id } = await params;

  const ponuda = await getPonuda(id);

  if (!ponuda) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">
            {ponuda.title}
          </h1>

          {ponuda.izabrana && (
            <span className="inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Izabrana
            </span>
          )}
        </div>
      </div>

      {/* INFO */}
      <div className="border border-gray-300 bg-gray-50 p-3">
        <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
          Informacije o ponudi
        </h3>

        <div className="text-sm">
          {/* PROJEKAT */}
          <div className="border-b border-gray-200 py-2">
            <p className="text-xs text-gray-500">
              Projekat
            </p>

            {ponuda.projekatId ? (
              <Link
                href={`/projekti/${ponuda.projekatId}`}
                className="leading-7 text-gray-700 hover:text-gray-900 hover:underline"
              >
                {ponuda.projekatTitle || "-"}
              </Link>
            ) : (
              <p className="leading-7">-</p>
            )}
          </div>

          {/* IZNOS */}
          <div className="border-b border-gray-200 py-2">
            <p className="text-xs text-gray-500">
              Iznos ponude
            </p>

            <p className="leading-7 font-medium">
              {ponuda.amount > 0
                ? `${formatAmount(ponuda.amount)} RSD`
                : "-"}
            </p>
          </div>

          {/* DOKUMENTI */}
          <div className="py-2">
            <p className="text-xs text-gray-500 mb-1">
              Dokumenti
            </p>

            {ponuda.dokumenti.length > 0 ? (
              <div className="space-y-1">
                {ponuda.dokumenti.map((dokument) => (
                  <a
                    key={dokument.id}
                    href={dokument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-1 leading-6 text-gray-700 hover:text-gray-900 hover:underline"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-gray-500" />
                    <span>{dokument.naziv}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="leading-7 text-gray-500">
                -
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

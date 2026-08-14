import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml, toRoman } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import type { Prostor } from "@/types/prostor";
import { Scaling, Layers3, Users } from "lucide-react";
import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

async function getProstor(id: string): Promise<Prostor | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/jsonapi/node/prostor/${id}?include=field_prostor_tip,field_prostor_sprat`,
      {
        headers: { Accept: "application/vnd.api+json" },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const item = data?.data;

    const tipRel = item.relationships?.field_prostor_tip?.data;
    const tipIncluded =
      tipRel &&
      data.included?.find(
        (i: any) => i.type === tipRel.type && i.id === tipRel.id
      );

    const spratRel = item.relationships?.field_prostor_sprat?.data;
    const spratIncluded =
      tipRel &&
      data.included?.find(
        (i: any) => i.type === spratRel.type && i.id === spratRel.id
      );

    if (!item) return null;

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      tip: tipIncluded?.attributes?.name || "-",
      sprat: spratIncluded?.attributes?.name || "-",
      kvadratura: item.attributes.field_prostor_kvadratura,
      broj_stanara: item.attributes.field_prostor_broj_stanara,
      vlasnik: item.attributes.field_prostor_vlasnik,
      //stanari: item.attributes.field_stanari ?? "",
      telefon: item.attributes.field_prostor_telefon,
      email: item.attributes.field_prostor_email,
    };
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProstorPage({ params }: PageProps) {
  const { id } = await params;
  const prostor = await getProstor(id);

  if (!prostor) notFound();

  const spratRoman = typeof prostor.sprat === "number" ? toRoman(prostor.sprat) : null;

  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{prostor.title}</h1>

        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">

          {!!prostor.broj_stanara && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{prostor.broj_stanara}</span>
            </div>
          )}

          {prostor.sprat && (
            <div className="flex items-center gap-1.5">
              <Layers3 className="h-4 w-4" />
              <span>{prostor.sprat}</span>
            </div>
          )}

          {!!prostor.kvadratura && (
            <div className="flex items-center gap-1.5">
              <Scaling className="h-4 w-4" />
              <span>{prostor.kvadratura} m²</span>
            </div>
          )}

        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">

        {/* INFO */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Info
          </h3>

          <div className="text-sm space-y-2">

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Broj stanara</p>
              <p className="leading-7">{prostor.broj_stanara ?? "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Sprat</p>
              <p className="leading-7">{prostor.sprat ?? "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Kvadratura</p>
              <p className="leading-7">{prostor.kvadratura ?? "-"} m²</p>
            </div>

          </div>
        </div>

        {/* VLASNIK */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Kontakt
          </h3>

          <div className="text-sm space-y-2">

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Tip</p>
              <p className="leading-7">{prostor.tip ?? "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Telefon</p>
              <p className="leading-7">{prostor.telefon ?? "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">E-mail</p>
              <p className="leading-7">{prostor.email ?? "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* OPIS */}
      {!isEmptyHtml(prostor.body) && (
        <div
          className="border border-gray-300 bg-white p-4 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: prostor.body }}
        />
      )}

    </div>
  );
}

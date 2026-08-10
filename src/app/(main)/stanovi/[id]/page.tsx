import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml, toRoman } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import type { Stan } from "@/types/stan";
import { Scaling, Layers3, Users } from "lucide-react";
import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

async function getStan(id: string): Promise<Stan | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/jsonapi/node/stan/${id}?include=field_stan_images,field_tip_stana`,
      {
        headers: { Accept: "application/vnd.api+json" },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const item = data?.data;

    if (!item) return null;

    const images = extractImages(item, data.included, "field_stan_images") ?? [];

    const tipRel = item.relationships?.field_tip_stana?.data;
    const tipIncluded =
      tipRel &&
      data.included?.find(
        (i: any) => i.type === tipRel.type && i.id === tipRel.id
      );

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      image: images,
      sprat: item.attributes.field_sprat,
      kvadratura: item.attributes.field_kvadratura,
      broj_stanara: item.attributes.field_stan_broj_stanara,
      tip: tipIncluded?.attributes?.name || "-",
      vlasnik: item.attributes.field_vlasnik,
      stanari: item.attributes.field_stanari ?? "",
      telefon: item.attributes.field_stan_telefon,
      email: item.attributes.field_stan_email,
      tip_prostora: item.attributes.field_vlasnik,

    };
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StanPage({ params }: PageProps) {
  const { id } = await params;
  const stan = await getStan(id);

  if (!stan) notFound();

  const images = stan.image ?? [];

  const spratRoman =
    typeof stan.sprat === "number" ? toRoman(stan.sprat) : null;

  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{stan.title}</h1>

        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">

          {!!stan.broj_stanara && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{stan.broj_stanara}</span>
            </div>
          )}

          {spratRoman && (
            <div className="flex items-center gap-1.5">
              <Layers3 className="h-4 w-4" />
              <span>{spratRoman}</span>
            </div>
          )}

          {!!stan.kvadratura && (
            <div className="flex items-center gap-1.5">
              <Scaling className="h-4 w-4" />
              <span>{stan.kvadratura} m²</span>
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
        <p className="leading-7">{stan.broj_stanara ?? "-"}</p>
      </div>

      <div className="border-b border-gray-200 py-2">
        <p className="text-xs text-gray-500">Sprat</p>
        <p className="leading-7">{spratRoman ?? "-"}</p>
      </div>

      <div className="border-b border-gray-200 py-2">
        <p className="text-xs text-gray-500">Kvadratura</p>
        <p className="leading-7">{stan.kvadratura ?? "-"} m²</p>
      </div>

    </div>
  </div>

  {/* VLASNIK */}
  <div className="border border-gray-300 bg-gray-50 p-3">
    <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
      Vlasnik
    </h3>

    <div className="text-sm space-y-2">

    {!stan.vlasnik ? (
      <p className="text-xs text-gray-500 py-2">
        Nema unetog vlasnika
      </p>
    ) : (
      <div className="text-sm border-b border-gray-200 py-2">

        <p className="text-xs text-gray-500">
          Ime i prezime
        </p>

        <p className="leading-7">
          {stan.vlasnik ?? "-"}
        </p>

      </div>
    )}

      <div className="border-b border-gray-200 py-2">
        <p className="text-xs text-gray-500">Telefon</p>
        <p className="leading-7">{stan.telefon ?? "-"}</p>
      </div>

      <div className="border-b border-gray-200 py-2">
        <p className="text-xs text-gray-500">E-mail</p>
        <p className="leading-7">{stan.email ?? "-"}</p>
      </div>
</div>
  </div>

</div>

      {/* OPIS */}
      {!isEmptyHtml(stan.body) && (
        <div
          className="border border-gray-300 bg-white p-4 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: stan.body }}
        />
      )}

    </div>
  );
}

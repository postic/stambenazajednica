import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml, toRoman } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import type { Stan } from "@/types/stan";
import { parseStan } from "@/lib/drupal/getStan";
import { Scaling, Layers3, Users } from "lucide-react";
import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

async function getStan(id: string): Promise<Stan | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/jsonapi/node/stan/${id}?include=field_stan_images,field_tip_stana,field_vlasnik,field_stanari`,
      {
        headers: { Accept: "application/vnd.api+json" },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const item = data?.data;

    if (!item) return null;

    const stan = parseStan(data);

    const images = extractImages(item, data.included, "field_stan_images") ?? [];

    const tipRel = item.relationships?.field_tip_stana?.data;
    const tipIncluded =
      tipRel &&
      data.included?.find(
        (i: any) => i.type === tipRel.type && i.id === tipRel.id
      );

    const vlasnikRel = item.relationships?.field_vlasnik?.data;
    const vlasnikIncluded =
      vlasnikRel &&
      data.included?.find(
        (i: any) => i.type === vlasnikRel.type && i.id === vlasnikRel.id
      );
    const vlasnik =
      vlasnikIncluded?.attributes?.display_name ||
      vlasnikIncluded?.attributes?.name ||
      null;
    const vlasnikUuid = vlasnikIncluded?.id ?? null;

    const stanariRel = item.relationships?.field_stanari?.data || [];
    const stanari = stanariRel
      .map((rel: any) => {
        const user = data.included?.find(
          (i: any) => i.type === rel.type && i.id === rel.id
        );

        if (!user) return null;

        return {
          id: user.id, // UUID
          uid: user.attributes?.drupal_internal__uid, // ako ti treba numeric
          title:
            user.attributes?.display_name ||
            user.attributes?.name ||
            "Nepoznat",
          isVlasnik: false, // možeš kasnije override
        };
      })
      .filter(Boolean);

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
      vlasnik: vlasnik,
      vlasnikUuid: vlasnikUuid,
      stanari: stanari,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* INFO */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Info
          </h3>

          <div className="text-sm space-y-2">

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Broj stanara</p>
              <p>{stan.broj_stanara ?? "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Sprat</p>
              <p>{spratRoman ?? "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Kvadratura</p>
              <p>{stan.kvadratura ?? "-"} m²</p>
            </div>

          </div>
        </div>

        {/* STANARI */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Stanari
          </h3>

          <div className="text-sm space-y-2">
            {stan.stanari.length ? (
              stan.stanari.map((s: any) => (
                <div key={s.id} className="border-b border-gray-200 py-2">
                  <p className="text-xs text-gray-500">
                    {s.isVlasnik ? "Vlasnik stana" : "Stanar"}
                  </p>

                  <Link
                    href={`/stanari/${s.id}`}
                    className="hover:underline text-inherit"
                  >
                    {s.title}
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-2">Nema stanara</p>
            )}
          </div>

        </div>

        {/* VLASNIK */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Vlasnik
          </h3>

          {!stan.vlasnik ? (
            <p className="text-xs text-gray-500 py-2">
              Nema unetog vlasnika
            </p>
          ) : (
            <div className="text-sm border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Ime i prezime</p>

              {stan.vlasnikUuid ? (
                <Link
                  href={`/stanari/${stan.vlasnikUuid}`}
                  className="text-inherit hover:underline"
                >
                  {stan.vlasnik}
                </Link>
              ) : (
                <p>{stan.vlasnik ?? "-"}</p>
              )}
            </div>
          )}
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

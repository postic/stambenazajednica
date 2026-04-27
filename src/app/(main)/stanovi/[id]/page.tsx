import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import BackButton from "@/components/BackButton";
import type { Stan } from "@/types/stan";
import { parseStan } from "@/lib/drupal/getStan";

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
    const stan = parseStan(data);

    if (!item) return null;

    const images =
      extractImages(item, data.included, "field_stan_images") ?? [];

    const tipRel = item.relationships?.field_tip_stana?.data;
    const tipIncluded =
      tipRel &&
      data.included?.find(
        (i: any) => i.type === tipRel.type && i.id === tipRel.id
      );

    const tipName = tipIncluded?.attributes?.name || "-";

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      image: images,
      sprat: item.attributes.field_sprat,
      kvadratura: item.attributes.field_kvadratura,
      tip: tipName ?? "",
      vlasnik: stan.vlasnik,
      stanari: stan.stanari || [],
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

  return (
    <div className="max-w-5xl text-gray-800">

      {/* BACK */}
      <div className="mb-4">
        <BackButton />
      </div>

      {/* TITLE */}
      <h1 className="text-xl font-semibold mb-1">
        {stan.title}
      </h1>

      {/* META (ticket header line) */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-5 border-b border-gray-200 pb-2">
        {stan.sprat !== undefined && (
          <span>🏢 Sprat: {stan.sprat}</span>
        )}
        {stan.kvadratura !== undefined && (
          <span>📐 {stan.kvadratura} m²</span>
        )}
        {stan.tip && (
          <span>🏷️ {stan.tip}</span>
        )}
      </div>

      {/* GRID PANELS (with background like kvarovi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* INFO */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Info
          </h3>

          <div className="text-sm">
            {stan.sprat !== undefined && (
              <div className="flex justify-between border-b border-gray-200 py-2">
                <span>Sprat</span>
                <span>{stan.sprat}</span>
              </div>
            )}

            {stan.kvadratura !== undefined && (
              <div className="flex justify-between border-b border-gray-200 py-2">
                <span>Kvadratura</span>
                <span>{stan.kvadratura} m²</span>
              </div>
            )}

            {stan.tip && (
              <div className="flex justify-between py-2">
                <span>Tip</span>
                <span>{stan.tip}</span>
              </div>
            )}
          </div>
        </div>

        {/* STANARI */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Stanari
          </h3>

          <div className="text-sm">
            {stan.stanari.length > 0 ? (
              stan.stanari.map((s: any) => (
                <div
                  key={s.id}
                  className="flex justify-between border-b border-gray-200 py-2"
                >
                  <span>{s.title}</span>
                  {s.isVlasnik && (
                    <span className="text-gray-400">vlasnik</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400">Nema stanara</div>
            )}
          </div>
        </div>

        {/* VLASNIK */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Vlasnik
          </h3>

          <div className="text-sm text-gray-700">
            {stan.vlasnik || "nije definisan"}
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

      {/* IMAGES (KVAROVI / SYSTEM STYLE) */}
      {images.length > 0 && (
        <div className="mb-6 border border-slate-200">

          {/* HEADER */}
          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-sm font-medium">
            Fotografije
          </div>

          {/* CONTENT */}
          <div className="p-4 [&_img]:rounded-none [&_img]:shadow-none">
            <ImageGridLightbox images={images} />
          </div>

        </div>
      )}

    </div>
  );
}

import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import BackButton from "@/components/BackButton";
import { Stan } from "@/features/stanovi/types";
import { getVlasnikTitle } from '@/lib/drupal/getStan';

const BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

async function getStan(id: string): Promise<Stan | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/jsonapi/node/stan/${id}?include=field_stan_images,field_tip_stana,field_vlasnik`,
      {
        headers: { Accept: "application/vnd.api+json" },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("Fetch failed:", res.status);
      return null;
    }

    const data = await res.json();
    const item = data?.data;
    const vlasnikTitle = getVlasnikTitle(data);

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
      vlasnik: vlasnikTitle,
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
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

  // 🧠 da li ima info podataka
  const hasInfo =
    stan.sprat !== undefined || stan.kvadratura !== undefined;

  return (
    <div className="max-w-5xl">

      {/* 🔙 BACK */}
      <BackButton />

      {/* 🔝 HEADER */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-800">
          {stan.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
          {stan.sprat !== undefined && (
            <span>🏢 Sprat: {stan.sprat}</span>
          )}

          {stan.kvadratura !== undefined && (
            <span>📐 {stan.kvadratura} m²</span>
          )}
        </div>
      </div>

      {/* 🖼️ SLIKE */}
      {images.length > 0 && (
        <div className="mb-8">
          <ImageGridLightbox images={images} />
        </div>
      )}

      {/* 📦 CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

        {/* ℹ️ INFO */}
        {hasInfo && (
          <div className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold mb-3">Info</h3>

            <div className="space-y-2 text-sm text-gray-600">
              {stan.sprat !== undefined && (
                <div className="flex justify-between">
                  <span>Sprat</span>
                  <span>{stan.sprat}</span>
                </div>
              )}

              {stan.kvadratura !== undefined && (
                <div className="flex justify-between">
                  <span>Kvadratura</span>
                  <span>{stan.kvadratura} m²</span>
                </div>
              )}

              {stan.tip !== undefined && (
                <div className="flex justify-between">
                  <span>Tip stana</span>
                  <span>{stan.tip}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 👥 STANARI */}
        <div className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold mb-3">Stanari</h3>

          <p className="text-sm text-gray-500">
            (ovde ide lista stanara)
          </p>
        </div>

        {/* 👤 VLASNIK */}
        <div className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold mb-3">Vlasnik</h3>

          <p className="text-sm text-gray-500">
            <span>{stan.vlasnik}</span>
          </p>
        </div>
      </div>

      {/* 📄 OPIS */}
      {!isEmptyHtml(stan.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border"
          dangerouslySetInnerHTML={{ __html: stan.body }}
        />
      )}
    </div>
  );
}

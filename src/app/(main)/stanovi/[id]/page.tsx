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

      broj_stanara: item.attributes.field_stan_broj_stanara,
      email: item.attributes.field_stan_email,
      telefon: item.attributes.field_stan_telefon,

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

      {/* HEADER */}
      <div className="mb-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-xl font-semibold">
              {stan.title}
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(stan.created).toLocaleDateString("sr-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

        </div>

        <div className="mt-3 border-b border-gray-200"></div>
      </div>


      {/* GRID PANELS (with background like kvarovi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* INFO */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Info
          </h3>

          <div className="text-sm">

            <div className="border-b border-gray-200 py-2 border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Broj stanara</p>
              <p>{stan.broj_stanara || "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2 border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Sprat</p>
              <p>{stan.sprat || "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2 border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Kvadratura</p>
              <p>{stan.kvadratura || "-"}  m²</p>
            </div>

            <div className="border-b border-gray-200 py-2 border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Telefon</p>
              <p>{stan.telefon || "-"}</p>
            </div>

            <div className="py-2">
              <p className="text-xs text-gray-500">E-mail</p>
              <p>{stan.email || "-"}</p>
            </div>

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
                  className="border-b border-gray-200 py-2"
                >
                  <p className="text-xs text-gray-500">
                    {s.isVlasnik ? "Vlasnik stana" : "Stanar"}
                  </p>
                  <p>{s.title}</p>
                </div>
              ))
            ) : (
              <div className="text-gray-400">
                <p className="text-xs text-gray-500 py-2">Nema stanara</p>
              </div>
            )}
          </div>
        </div>

        {/* VLASNIK */}
        <div className="border border-gray-300 bg-gray-50 p-3">
          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Vlasnik
          </h3>
          {!stan.vlasnik ? (
            <div className="text-gray-400">
              <p className="text-xs text-gray-500 py-2">Nema unetog vlasnika</p>
            </div>
          ) : (
          <div className="text-sm">
            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Ime i prezime</p>
              <p>{stan.vlasnik}</p>
            </div>
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

      {/*}
      {images.length > 0 && (
        <div className="mb-6 border border-slate-200">
          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-sm font-medium">
            Fotografije
          </div>
          <div className="p-4 [&_img]:rounded-none [&_img]:shadow-none">
            <ImageGridLightbox images={images} />
          </div>

        </div>
      )}
      {*/}

    </div>
  );
}

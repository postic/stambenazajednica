import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";

import StatusBadge from "@/components/StatusBadge";
import type { Stanar } from "@/types/stanar";

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

// FETCH STANAR
async function getStanar(id: string): Promise<Stanar | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/stanar/${id}?include=field_user_image`,
      {
        headers: { Accept: "application/vnd.api+json" },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const item = data?.data;

    if (!item) return null;

    const images: string[] =
      extractImages(item, data.included, "field_user_image") ?? [];

    return {
      id: item.id,
      ime_prezime:
        item.attributes.field_ime_prezime ||
        item.attributes.display_name ||
        "",
      created: item.attributes.created,
      email: item.attributes.field_email ?? "",
      telefon: item.attributes.field_telefon ?? "",
      jmbg: item.attributes.field_jmbg ?? "",
      licna_karta: item.attributes.field_licna_karta ?? "",
      vozilo: item.attributes.field_vozilo ?? "",
      status: Boolean(item.attributes.field_status_stanara),
      tip: Boolean(item.attributes.field_podstanar),
      image: images,
    };
  } catch {
    return null;
  }
}

// FETCH STANOVI
async function getStanoviZaStanar(stanarId: string) {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/stan?filter[field_stanari.id]=${stanarId}`,
      {
        headers: { Accept: "application/vnd.api+json" },
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    return data.data.map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      sprat: item.attributes.field_sprat,
    }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StanarPage({ params }: PageProps) {
  const { id } = await params;

  const stanar = await getStanar(id);
  if (!stanar) notFound();

  const stanovi = await getStanoviZaStanar(id);

  return (
    <div className="max-w-5xl">

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div data-field>
            <h1 className="text-xl font-semibold">
              {stanar.ime_prezime}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {stanovi.length > 0 &&
                stanovi.map((stan: any) => (
                  stan.title || "-"
              ))}
            </p>

          </div>
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={stanar.status ? "aktivan" : "pasivan"} />
            <StatusBadge status={stanar.tip ? "podstanar" : "stanar"} />
          </div>
        </div>
      </div>

      {/* 🧱 3-COLUMN SYSTEM (KVAROVI STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* 📸 FOTOGRAFIJE */}
        <div className="border border-gray-300 bg-slate-50 p-4">

          <div className="text-sm font-semibold mb-3 border-b border-gray-300 pb-1">
            Fotografija
          </div>

          <div data-field>
            {stanar.image && stanar.image.length > 0 ? (
              <img
                src={stanar.image[0]}
                alt={stanar.ime_prezime}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="text-xs text-gray-400">
                Nema fotografije
              </div>
            )}
          </div>

        </div>

        {/* 👤 INFO */}
        <div className="border border-gray-300 bg-slate-50 p-4">

          <h2 className="text-sm font-semibold mb-3 border-b border-gray-300 pb-1">
            Info
          </h2>

          <div className="text-sm space-y-2">

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Ime i prezime</p>
              <p>{stanar.ime_prezime || "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">JMBG</p>
              <p>{stanar.jmbg ? `****${stanar.jmbg.slice(-4)}` : "-"}</p>
            </div>

            <div className="py-2">
              <p className="text-xs text-gray-500">Lična karta</p>
              <p>{stanar.licna_karta || "-"}</p>
            </div>

          </div>
        </div>

        {/* 📞 KONTAKT */}
        <div className="border border-gray-300 bg-slate-50 p-4">

          <h2 className="text-sm font-semibold mb-3 border-b border-gray-300 pb-1">
            Kontakt
          </h2>

          <div className="text-sm space-y-2">

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Telefon</p>
              <p>{stanar.telefon || "-"}</p>
            </div>

            <div className="border-b border-gray-200 py-2">
              <p className="text-xs text-gray-500">Email</p>
              <p>{stanar.email || "-"}</p>
            </div>

            <div className="py-2">
              <p className="text-xs text-gray-500">Vozilo</p>
              <p>{stanar.vozilo || "-"}</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

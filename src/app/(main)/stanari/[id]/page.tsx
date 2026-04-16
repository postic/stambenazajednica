import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";
import type { Stanar } from "@/types/stanar";

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

// fetch jednog stanara
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

    const images: string[] = extractImages(item, data.included, "field_user_image") ?? [];

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      ime_prezime: item.attributes.field_ime_prezime ?? "",
      email: item.attributes.field_email ?? "",
      telefon: item.attributes.field_telefon ?? "",
      jmbg: item.attributes.field_jmbg ?? "",
      licna_karta: item.attributes.field_licna_karta ?? "",
      vozilo: item.attributes.field_vozilo ?? "",
      status: Boolean(item.attributes.field_status_stanara),
      tip: Boolean(item.attributes.field_podstanar),
      image: images,
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
    return null;
  }
}

// fetch stanova gde je stanar vlasnik ili stanar
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
      broj: item.attributes.field_broj,
    }));
  } catch (e) {
    console.error(e);
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
    <div className="max-w-5xl space-y-6">
      <BackButton />

      {/* 🧍 PROFIL */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* AVATAR */}
        <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-700 overflow-hidden">
        {stanar.image && stanar.image.length > 0 ? (
          <img
            src={stanar.image[0]} // uzimamo prvu sliku iz niza
            alt={stanar.title}
            className="w-full h-full object-cover"
          />
        ) : (
          // Ako nema slike, prikazujemo inicijale
          <span>
            {stanar.title
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </span>
        )}
      </div>

        {/* INFO */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h1 className="text-2xl font-semibold text-slate-800">
            {stanar.ime_prezime || stanar.title}
          </h1>

          {/* 🟢 STATUS + TIP */}
          <div className="flex gap-2 mt-2 justify-center md:justify-start flex-wrap">
            <StatusBadge status={stanar.status ? "aktivan" : "pasivan"} />
            <StatusBadge status={stanar.tip ? "podstanar" : "stanar"} />
          </div>

          <p className="text-gray-400 text-xs mt-2">
            Kreirano:{" "}
            {new Date(stanar.created).toLocaleDateString("sr-RS", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* GRID 50/50 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 👤 LIČNI PODACI */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4 h-full">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Lični podaci
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400">Ime i prezime</p>
              <p className="font-medium text-slate-700">
                {stanar.ime_prezime || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">JMBG</p>
              <p className="font-medium text-slate-700">
                {stanar.jmbg ? `**** **** ${stanar.jmbg.slice(-4)}` : "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Lična karta</p>
              <p className="font-medium text-slate-700">
                {stanar.licna_karta || "-"}
              </p>
            </div>

          </div>
        </div>

        {/* 📞 KONTAKT */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4 h-full">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Kontakt
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400">Telefon</p>
              <p className="font-medium">{stanar.telefon || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium">{stanar.email || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400">Vozilo</p>
              <p className="font-medium">{stanar.vozilo || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🏠 STANOVI */}
      {stanovi.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-sm font-semibold uppercase text-slate-500 mb-4">
            Stanovi
          </h2>

          <div className="space-y-3">
            {stanovi.map((stan: any) => (
              <div
                key={stan.id}
                className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-slate-800 inline-flex items-center gap-2">
                    Stan {stan.title || "-"}
                    {stanar.tip !== undefined && ( <StatusBadge status={stanar.tip ? "Podstanar" : "Stanar"} /> )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Sprat: {stan.sprat || "-"}
                  </p>
                </div>

                {/* LINK KA STANU */}
          <a
            href={`/stanovi/${stan.id}`}
            className="text-xs text-blue-600 hover:underline"
          >
            Pogledaj →
          </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📝 OPIS */}
      {stanar.body && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-sm font-semibold uppercase text-slate-500 mb-3">
            Napomena
          </h2>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: stanar.body }}
          />
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";
import UserAvatar from "@/components/UserAvatar";
import { Stanar } from "@/features/stanari/types";

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

async function getStanar(id: string): Promise<Stanar | null> {
  try {
    // Include media image
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/stanar/${id}?include=field_user_image`,
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
    const included = data?.included || [];

    if (!item) return null;

    // 1️⃣ pronađi media entity
    const mediaId = item.relationships?.field_user_image?.data?.id;

    const media = included.find(
      (i: any) => i.type === "file--file" && i.id === mediaId
    );

    const imageUrl = media?.attributes?.uri?.url;

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      telefon: item.attributes.field_telefon ?? "",
      email: item.attributes.field_email ?? "",
      status: item.attributes.field_status ?? "aktivan",

      image: imageUrl ? `${NEXT_PUBLIC_DRUPAL_BASE_URL}${imageUrl}` : "",
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StanarPage({ params }: PageProps) {
  const { id } = await params;

  const stanar = await getStanar(id);

  if (!stanar) notFound();

  return (
    <div className="max-w-5xl space-y-6">
      {/* 🔙 BACK BUTTON */}
      <BackButton />

      {/* 🖼️ PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* SLIKA */}
        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
          {stanar.image ? (
            <img
              src={stanar.image}
              alt={stanar.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">Nema slike</span>
          )}
        </div>

        {/* INFO */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h1 className="text-2xl font-semibold text-slate-800">{stanar.title}</h1>
          <p className="text-sm text-gray-500">{stanar.telefon || "—"}</p>

          <div className="flex justify-center md:justify-start mt-2">
            <StatusBadge status={stanar.status} />
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

      {/* 🧱 GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 👤 OSNOVNE INFORMACIJE */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Osnovne informacije
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400">Tip</p>
              <p className="font-medium text-slate-700">{stanar.telefon || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400">Telefon</p>
              <p className="font-medium text-slate-700">{stanar.telefon || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium text-slate-700">{stanar.email || "-"}</p>
            </div>
          </div>
        </div>

        {/* 📊 STATUS */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Status</h2>
          <StatusBadge status={stanar.status} />
        </div>
      </div>

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

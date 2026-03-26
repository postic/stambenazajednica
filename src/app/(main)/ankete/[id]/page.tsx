import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";
import { Anketa } from "@/features/ankete/types";

const NEXT_PUBLIC_DRUPAL_BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

async function getAnketa(id: string): Promise<Anketa | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/anketa/${id}`,
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
    if (!item) return null;

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      status: item.attributes.field_status_ankete,
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnketaPage({ params }: PageProps) {
  const { id } = await params;

  const anketa = await getAnketa(id);

  if (!anketa) notFound();

  return (
    <div className="max-w-4xl">

      {/* 🔙 BACK BUTTON */}
      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {anketa.title}
        {anketa.status && <StatusBadge status={anketa.status} />}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(anketa.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* 📄 OPIS */}
      {!isEmptyHtml(anketa.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border"
          dangerouslySetInnerHTML={{ __html: anketa.body }}
        />
      )}
    </div>
  );
}

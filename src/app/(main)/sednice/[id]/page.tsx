import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";

interface Sednica {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  type?: string; // naziv statusa iz taxonomy term
}

const DRUPAL_BASE_URL = process.env.DRUPAL_BASE_URL || "http://localhost:8888";

async function getSednica(id: string): Promise<Sednica | null> {
  try {
    const res = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/sednica/${id}?include=field_status_sednice`,
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

    / === parsiranje statusa === /
    const statusRel = item.relationships?.field_status_sednice?.data;
    const statusIncluded =
      statusRel &&
      data.included?.find(
        (i: any) => i.type === statusRel.type && i.id === statusRel.id
      );
    const typeName = statusIncluded?.attributes?.name || "Nepoznat";

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      type?: string; // naziv statusa, opcionalno
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SednicaPage({ params }: PageProps) {
  const { id } = await params;

  const sednica = await getSednica(id);

  if (!sednica) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      {/* 🔙 BACK BUTTON */}
      <BackButton />
      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {sednica.title}
        {sednica.typeName && <StatusBadge status={sednica.typeName} />}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(sednica.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: sednica.body }}
      />
    </div>
  );
}

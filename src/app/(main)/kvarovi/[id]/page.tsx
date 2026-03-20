import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";

interface Kvar {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  statusName?: string; // naziv statusa iz taxonomy term
}

const DRUPAL_BASE_URL = process.env.DRUPAL_BASE_URL || "http://localhost:8888";

async function getKvar(id: string): Promise<Kvar | null> {
  try {
    const res = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/kvar/${id}?include=field_status,field_image`,
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

    const images: string[] = extractImages(item, data.included, "field_image") ?? [];

    / === parsiranje statusa === /
    const statusRel = item.relationships?.field_status?.data;
    const statusIncluded =
      statusRel &&
      data.included?.find(
        (i: any) => i.type === statusRel.type && i.id === statusRel.id
      );
    const statusName = statusIncluded?.attributes?.name || "Nepoznat";

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      image: images,
      statusName: statusName,
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KvarPage({ params }: PageProps) {
  const { id } = await params;

  const kvar = await getKvar(id);

  if (!kvar) notFound();

  const images = kvar.image ?? [];

  return (
    <div className="max-w-4xl mx-auto">

      {/* 🔙 BACK BUTTON */}
      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {kvar.title}
        {kvar.statusName && <StatusBadge status={kvar.statusName} />}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(kvar.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* 🔥 Slider se prikazuje SAMO ako ima slika */}
      {images.length > 0 && (
        <div className="mb-6">
          <ImageGridLightbox images={images} />
        </div>
      )}


      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: kvar.body }}
      />
    </div>
  );
}

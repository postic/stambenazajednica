import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";
import { Obavestenje } from "@/features/obavestenja/types";

const NEXT_PUBLIC_DRUPAL_BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

async function getObavestenje(id: string): Promise<Obavestenje | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}?include=field_image`,
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

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      images: images,
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ObavestenjePage({ params }: PageProps) {
  const { id } = await params;

  const obavestenje = await getObavestenje(id);

  if (!obavestenje) notFound();

  const images = obavestenje.images ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* 🔙 BACK BUTTON */}
      <BackButton />
      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {obavestenje.title}
        {obavestenje.type && <StatusBadge status={obavestenje.type} />}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(obavestenje.created).toLocaleDateString("sr-RS", {
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

      {/* 📄 OPIS */}
      {!isEmptyHtml(obavestenje.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border"
          dangerouslySetInnerHTML={{ __html: obavestenje.body }}
        />
      )}
    </div>
  );
}

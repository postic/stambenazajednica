import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";
import type { Kvar } from "@/types/kvar";

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

async function getKvar(id: string): Promise<Kvar | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar/${id}?include=field_image`,
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
      extractImages(item, data.included, "field_image") ?? [];

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      description: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      status: item.attributes.field_status_kvara,
      priority: item.attributes.field_prioritet_kvara,
      image: images,
    };
  } catch (e) {
    console.error(e);
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
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6">
        <BackButton />

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {kvar.title}
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              {new Date(kvar.created).toLocaleDateString("sr-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {kvar.status && <StatusBadge status={kvar.status} />}
            {kvar.priority && <StatusBadge prioritet={kvar.priority} />}
          </div>
        </div>
      </div>

      {/* DESCRIPTION (ABOVE IMAGES) */}
      {!isEmptyHtml(kvar.body) && (
        <div className="border border-slate-200 bg-slate-50 p-4 mb-6">
          <div
            className="text-sm text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: kvar.body }}
          />
        </div>
      )}

      {/* IMAGES (NO ROUNDED, FLAT STYLE) */}
      {images.length > 0 && (
        <div className="mb-6 border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-sm font-medium">
            Fotografije
          </div>

          <div className="p-4 [&_img]:rounded-none">
            <ImageGridLightbox images={images} />
          </div>
        </div>
      )}
    </div>
  );
}

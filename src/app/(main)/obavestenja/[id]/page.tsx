import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";

import type { Obavestenje } from "@/types/obavestenje";

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

async function getObavestenje(
  id: string
): Promise<Obavestenje | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}?include=field_image,uid`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    const item = data?.data;

    if (!item) return null;

    // ==================================================
    // IMAGES
    // ==================================================

    const images: string[] =
      extractImages(
        item,
        data.included,
        "field_image"
      ) ?? [];

    // ==================================================
    // AUTHOR
    // ==================================================

    let author: string | null = null;

    const authorRelationship =
      item.relationships?.uid?.data;

    if (
      authorRelationship &&
      Array.isArray(data.included)
    ) {
      const authorObject =
        data.included.find(
          (includedItem: any) =>
            includedItem.type === "user--user" &&
            includedItem.id ===
              authorRelationship.id
        );

      author =
        authorObject?.attributes?.name ??
        null;
    }

    // ==================================================
    // RESULT
    // ==================================================

    return {
      id: item.id,
      title:
        item.attributes?.title ?? "",
      body:
        item.attributes?.body?.value ?? "",
      created:
        item.attributes?.created ?? "",
      author,
      images,
    };
  } catch (e) {
    console.error(
      "Greška pri učitavanju obaveštenja:",
      e
    );

    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ObavestenjePage({
  params,
}: PageProps) {
  const { id } = await params;

  const obavestenje =
    await getObavestenje(id);

  if (!obavestenje) {
    notFound();
  }

  const images =
    obavestenje.images ?? [];

  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6">

        <h1 className="text-xl font-semibold">
          {obavestenje.title}
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          {new Date(
            obavestenje.created
          ).toLocaleDateString(
            "sr-Latn-RS",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )}

          {obavestenje.author && (
            <>
              <span className="ml-2">Objavio: {obavestenje.author}</span>
            </>
          )}
        </p>

      </div>

      {/* DESCRIPTION */}
      {!isEmptyHtml(
        obavestenje.body
      ) && (
        <div className="border border-slate-200 bg-slate-50 p-4 mb-6">

          <div
            className="text-sm text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                obavestenje.body,
            }}
          />

        </div>
      )}

      {/* IMAGES */}
      {images.length > 0 && (
        <div className="mb-6 border border-slate-200">

          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-sm font-medium">
            Fotografije
          </div>

          <div className="p-4 [&_img]:rounded-none">
            <ImageGridLightbox
              images={images}
            />
          </div>

        </div>
      )}

    </div>
  );
}

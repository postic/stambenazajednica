import { notFound } from "next/navigation";

import ObavestenjeEditForm from "@/components/ObavestenjeEditForm";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

async function getObavestenje(
  id: string
) {
  try {
    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}?include=field_image,field_tip_obavestenja`,
      {
        headers: {
          Accept:
            "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    const item = data?.data;

    if (!item) {
      return null;
    }

    const category =
      item.relationships
        ?.field_tip_obavestenja
        ?.data;

    const kategorija =
      Array.isArray(category)
        ? category[0]?.id ?? ""
        : category?.id ?? "";

    const imageRelations =
      item.relationships
        ?.field_image
        ?.data;

    const imageItems =
      Array.isArray(imageRelations)
        ? imageRelations
        : imageRelations
          ? [imageRelations]
          : [];

    const images = imageItems
      .map((relation: any) => {
        const included =
          Array.isArray(data?.included)
            ? data.included.find(
                (includedItem: any) =>
                  includedItem.type ===
                    "file--file" &&
                  includedItem.id ===
                    relation.id
              )
            : null;

        const uri =
          included?.attributes?.uri
            ?.url || "";

        if (!uri) {
          return null;
        }

        const imageUrl =
          uri.startsWith("http")
            ? uri
            : `${DRUPAL_BASE_URL}${uri}`;

        return {
          id: relation.id,
          url: imageUrl,
        };
      })
      .filter(Boolean);

    return {
      title:
        item.attributes?.title ?? "",

      description:
        item.attributes?.body
          ?.value ?? "",

      kategorija,

      images,
    };
  } catch (error) {
    console.error(
      "Greška pri učitavanju obaveštenja za izmenu:",
      error
    );

    return null;
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function ObavestenjeEditPage({
  params,
}: PageProps) {
  const { slug, id } =
    await params;

  const obavestenje =
    await getObavestenje(id);

  if (!obavestenje) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Izmeni obaveštenje
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Izmenite podatke i fotografije
          obaveštenja.
        </p>
      </div>

      <ObavestenjeEditForm
        slug={slug}
        id={id}
        initialTitle={
          obavestenje.title
        }
        initialDescription={
          obavestenje.description
        }
        initialKategorija={
          obavestenje.kategorija
        }
        initialImages={
          obavestenje.images as {
            id: string;
            url: string;
          }[]
        }
      />
    </div>
  );
}

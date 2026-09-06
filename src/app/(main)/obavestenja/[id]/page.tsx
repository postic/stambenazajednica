import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";

import ImageGridLightbox from "@/components/ImageGridLightbox";
import ObavestenjeActions from "./ObavestenjeActions";

import type { Obavestenje } from "@/types/obavestenje";

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

async function getObavestenje(
  id: string
): Promise<{
  obavestenje: Obavestenje;
  authorUuid: string | null;
} | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}?include=field_image,uid`,
      {
        headers: {
          Accept:
            "application/vnd.api+json",
        },

        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data =
      await res.json();

    const item =
      data?.data;

    if (!item) {
      return null;
    }

    const images: string[] =
      extractImages(
        item,
        data.included,
        "field_image"
      ) ?? [];

    let author: string | null = null;

    const authorRelationship =
      item.relationships?.uid?.data;

    const authorUuid =
      authorRelationship?.id ??
      null;

    if (
      authorRelationship &&
      Array.isArray(data.included)
    ) {
      const authorObject =
        data.included.find(
          (includedItem: any) =>
            includedItem.type ===
              "user--user" &&
            includedItem.id ===
              authorRelationship.id
        );

      author =
        authorObject?.attributes?.name ??
        null;
    }

    return {
      obavestenje: {
        id: item.id,

        title:
          item.attributes?.title ??
          "",

        body:
          item.attributes?.body?.value ??
          "",

        created:
          item.attributes?.created ??
          "",

        author,
        images,
      },

      authorUuid,
    };
  } catch (error) {
    console.error(
      "Greška pri učitavanju obaveštenja:",
      error
    );

    return null;
  }
}

async function getCurrentUserUuid(): Promise<
  string | null
> {
  try {
    const cookieStore =
      await cookies();

    const authCookie =
      cookieStore.get(
        "next_auth"
      );

    if (!authCookie?.value) {
      return null;
    }

    let authUser: any;

    try {
      authUser =
        JSON.parse(
          authCookie.value
        );
    } catch {
      return null;
    }

    if (!authUser?.uid) {
      return null;
    }

    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/user/user?filter[uid]=${encodeURIComponent(
        authUser.uid.toString()
      )}`,
      {
        headers: {
          Accept:
            "application/vnd.api+json",
        },

        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data =
      await res.json();

    const user =
      Array.isArray(data?.data)
        ? data.data[0]
        : null;

    return user?.id ?? null;
  } catch (error) {
    console.error(
      "Greška pri pronalaženju trenutnog korisnika:",
      error
    );

    return null;
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ObavestenjePage({
  params,
}: PageProps) {
  const { id } =
    await params;

  const result =
    await getObavestenje(id);

  if (!result) {
    notFound();
  }

  const {
    obavestenje,
    authorUuid,
  } = result;

  const currentUserUuid =
    await getCurrentUserUuid();

  const isOwner =
    !!currentUserUuid &&
    !!authorUuid &&
    currentUserUuid ===
      authorUuid;

  const images =
    obavestenje.images ?? [];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
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
                  <span className="ml-2">
                    Objavio:{" "}
                    {obavestenje.author}
                  </span>
                </>
              )}
            </p>
          </div>

          {isOwner && (
            <ObavestenjeActions
              id={
                obavestenje.id
              }
            />
          )}
        </div>
      </div>

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

import { NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ slug: string }>;
  }
) {
  try {
    const { slug } = await context.params;

    const url =
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje` +
      `?include=field_tip_obavestenja` +
      `&sort=-created` +
      `&page[limit]=100`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.api+json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "Drupal API error:",
        response.status,
        text
      );

      return NextResponse.json(
        {
          error: "Greška pri dohvaćanju obaveštenja",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const included = data.included || [];

    // ================================================
    // PRONAĐI KATEGORIJU
    // ================================================

    const categoryMap = new Map<string, any>();

    included
      .filter(
        (item: any) =>
          item.type ===
          "taxonomy_term--tip_obavestenja"
      )
      .forEach((item: any) => {
        const name =
          item.attributes?.name || "";

        categoryMap.set(item.id, {
          id: item.id,
          name,
          slug: createSlug(name),
        });
      });

    // ================================================
    // PRONAĐI OBAVEŠTENJA IZ KATEGORIJE
    // ================================================

    const obavestenja = (data.data || [])
      .map((item: any) => {
        const categoryId =
          item.relationships
            ?.field_tip_obavestenja
            ?.data?.id;

        const category =
          categoryId
            ? categoryMap.get(categoryId)
            : null;

        return {
          id: item.id,
          title:
            item.attributes?.title || "",
          created:
            item.attributes?.created || null,
          categoryId:
            category?.id || null,
          categoryName:
            category?.name || null,
          categorySlug:
            category?.slug || null,
        };
      })
      .filter(
        (item: any) =>
          item.categorySlug === slug
      );

    // ================================================
    // RESPONSE
    // ================================================

    return NextResponse.json({
      data: obavestenja,
    });
  } catch (error) {
    console.error(
      "Server error fetching obaveštenja:",
      error
    );

    return NextResponse.json(
      {
        error: "Interna greška servera",
      },
      { status: 500 }
    );
  }
}

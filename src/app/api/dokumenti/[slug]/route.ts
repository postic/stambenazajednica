import { NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// GET
// ==================================================

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await context.params;

    const url =
      `${DRUPAL_BASE_URL}/jsonapi/node/dokument` +
      `?include=field_tip_dokumenta` +
      `&sort=-created` +
      `&page[limit]=100`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.api+json",
      },
      next: {
        revalidate: 60,
      },
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
          error: "Greška pri dohvaćanju dokumenata",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    // ==================================================
    // INCLUDED
    // ==================================================

    const included = data.included || [];

    const kategorijeMap = new Map();

    included
      .filter(
        (item: any) =>
          item.type ===
          "taxonomy_term--tip_dokumenta"
      )
      .forEach((item: any) => {
        const name =
          item.attributes?.name || "";

        const alias =
          item.attributes?.path?.alias || "";

        const generatedSlug =
          name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const termSlug =
          alias
            .replace(/^\/+/, "")
            .split("/")
            .filter(Boolean)
            .pop() ||
          generatedSlug;

        kategorijeMap.set(item.id, {
          id: item.id,
          name,
          slug: termSlug,
        });
      });

    // ==================================================
    // DOKUMENTI
    // ==================================================

    const dokumenti = (data.data || [])
      .map((item: any) => {
        const categoryId =
          item.relationships
            ?.field_tip_dokumenta
            ?.data?.id || null;

        const category =
          categoryId
            ? kategorijeMap.get(categoryId) ||
              null
            : null;

        return {
          id: item.id,

          title:
            item.attributes?.title || "",

          body:
            item.attributes?.body?.processed ||
            item.attributes?.body?.value ||
            "",

          created:
            item.attributes?.created || "",

          status:
            item.attributes
              ?.field_status_dokumenta ||
            "",

          category,
        };
      })
      .filter(
        (dok: any) =>
          dok.category?.slug === slug
      );

    // ==================================================
    // KATEGORIJA
    // ==================================================

    const category =
      dokumenti.length > 0
        ? dokumenti[0].category
        : null;

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Kategorija nije pronađena",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category,
      data: dokumenti,
    });
  } catch (error) {
    console.error(
      "Server error fetching kategoriju:",
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

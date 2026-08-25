import { NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// TYPES
// ==================================================

interface KategorijaDokumenta {
  id: string;
  name: string;
  slug: string;
  brojDokumenata: number;
}

// ==================================================
// SLUG
// ==================================================

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ==================================================
// GET
// ==================================================

export async function GET() {
  try {
    const url =
      `${DRUPAL_BASE_URL}/jsonapi/node/dokument` +
      `?include=field_tip_dokumenta` +
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
          error: "Greška pri dohvaćanju dokumenata",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const included = data.included || [];

    // ==================================================
    // KATEGORIJE
    // ==================================================

    const kategorije = new Map<
      string,
      KategorijaDokumenta
    >();

    included
      .filter(
        (item: any) =>
          item.type ===
          "taxonomy_term--tip_dokumenta"
      )
      .forEach((item: any) => {
        const name =
          item.attributes?.name || "";

        const slug = createSlug(name);

        kategorije.set(item.id, {
          id: item.id,
          name,
          slug,
          brojDokumenata: 0,
        });
      });

    // ==================================================
    // BROJ DOKUMENATA PO KATEGORIJI
    // ==================================================

    (data.data || []).forEach(
      (item: any) => {
        const categoryId =
          item.relationships
            ?.field_tip_dokumenta
            ?.data?.id;

        if (
          categoryId &&
          kategorije.has(categoryId)
        ) {
          const kategorija =
            kategorije.get(categoryId)!;

          kategorija.brojDokumenata++;
        }
      }
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      data: Array.from(
        kategorije.values()
      ),
    });
  } catch (error) {
    console.error(
      "Server error fetching kategorije:",
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

import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

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

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await context.params;

    // ==================================================
    // DOHVATI TELEFONE
    // ==================================================

    const url =
      `${DRUPAL_BASE_URL}/jsonapi/node/telefon` +
      `?include=field_kategorija` +
      `&sort=title` +
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
          error: "Greška pri dohvaćanju telefona",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const included = data.included || [];

    // ==================================================
    // PRONAĐI KATEGORIJU
    // ==================================================

    const kategorija = included.find(
      (item: any) => {
        if (
          item.type !==
          "taxonomy_term--kategorija_telefon"
        ) {
          return false;
        }

        const name =
          item.attributes?.name || "";

        return createSlug(name) === slug;
      }
    );

    if (!kategorija) {
      return NextResponse.json(
        {
          error: "Kategorija nije pronađena",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // FILTRIRAJ TELEFONE
    // ==================================================

    const telefoni = (data.data || [])
      .filter((item: any) => {
        const categoryId =
          item.relationships
            ?.field_kategorija
            ?.data?.id;

        return categoryId === kategorija.id;
      })
      .map((item: any) => ({
        id: item.id,

        naziv:
          item.attributes?.title || "",

        broj:
          item.attributes?.field_phone || "",

        kategorija: {
          id: kategorija.id,
          name:
            kategorija.attributes?.name || "",
        },
      }));

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      data: telefoni,
      kategorija: {
        id: kategorija.id,
        name:
          kategorija.attributes?.name || "",
        slug,
      },
    });
  } catch (error) {
    console.error(
      "Server error fetching telefona:",
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

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
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Greška pri dohvaćanju dokumenata",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const included =
      data.included || [];

    const kategorije = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
      }
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

        kategorije.set(item.id, {
          id: item.id,
          name,
          slug: createSlug(name),
        });
      });

    const dokumenti: Dokument[] =
      (data.data || [])
        .map((item: any) => {
          const categoryId =
            item.relationships
              ?.field_tip_dokumenta
              ?.data?.id || null;

          const category =
            categoryId
              ? kategorije.get(categoryId) ||
                null
              : null;

          return {
            id: item.id,

            title:
              item.attributes?.title || "",

            body:
              item.attributes?.body?.value ||
              "",

            created:
              item.attributes?.created ||
              "",

            status:
              item.attributes
                ?.field_status_dokumenta ||
              "",

            categoryId:
              category?.id || null,

            categoryName:
              category?.name || null,

            categorySlug:
              category?.slug || null,
          };
        })
        .filter(
          (item: Dokument) =>
            item.categorySlug === slug
        );

    const category =
      dokumenti.length > 0
        ? {
            id: dokumenti[0].categoryId!,
            name:
              dokumenti[0].categoryName!,
            slug:
              dokumenti[0].categorySlug!,
          }
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
      "Server error fetching dokumenti:",
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

interface Dokument {
  id: string;
  title: string;
  body: string;
  created: string;
  status: string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

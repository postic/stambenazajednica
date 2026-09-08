import { NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      slug: string;
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const url =
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}` +
      `?include=field_tip_obavestenja`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.api+json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return NextResponse.json(
        {
          error: "Obaveštenje nije pronađeno",
        },
        { status: 404 }
      );
    }

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "Drupal API error:",
        response.status,
        text
      );

      return NextResponse.json(
        {
          error:
            "Greška pri dohvaćanju obaveštenja",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const item = data.data;

    if (!item) {
      return NextResponse.json(
        {
          error: "Obaveštenje nije pronađeno",
        },
        { status: 404 }
      );
    }

    const categoryId =
      item.relationships
        ?.field_tip_obavestenja
        ?.data?.id || null;

    const category =
      (data.included || []).find(
        (included: any) =>
          included.id === categoryId &&
          included.type ===
            "taxonomy_term--tip_obavestenja"
      );

    return NextResponse.json({
      data: {
        id: item.id,

        title:
          item.attributes?.title || "",

        body:
          item.attributes?.body || null,

        created:
          item.attributes?.created || null,

        changed:
          item.attributes?.changed || null,

        categoryId,

        categoryName:
          category?.attributes?.name || null,
      },
    });
  } catch (error) {
    console.error(
      "Server error fetching obaveštenje:",
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

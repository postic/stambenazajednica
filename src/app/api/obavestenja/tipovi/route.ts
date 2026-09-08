import { NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

export async function GET() {
  try {
    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/tip_obavestenja`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "Drupal greška pri učitavanju tipova:",
        response.status,
        text
      );

      return NextResponse.json(
        {
          error: "Greška pri učitavanju tipova obaveštenja",
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    const tipovi = (result.data ?? []).map((term: any) => ({
      id: term.id,
      naziv: term.attributes?.name ?? "",
    }));

    return NextResponse.json({
      data: tipovi,
    });
  } catch (error) {
    console.error(
      "Greška pri učitavanju tipova obaveštenja:",
      error
    );

    return NextResponse.json(
      {
        error: "Greška na serveru",
      },
      { status: 500 }
    );
  }
}

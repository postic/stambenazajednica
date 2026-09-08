import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// TYPES
// ==================================================

interface KategorijaObavestenja {
  id: string;
  name: string;
  slug: string;
  brojObavestenja: number;
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

    // ==================================================
    // KATEGORIJE
    // ==================================================

    const kategorije = new Map<
      string,
      KategorijaObavestenja
    >();

    included
      .filter(
        (item: any) =>
          item.type ===
          "taxonomy_term--tip_obavestenja"
      )
      .forEach((item: any) => {
        const name =
          item.attributes?.name || "";

        const slug = createSlug(name);

        kategorije.set(item.id, {
          id: item.id,
          name,
          slug,
          brojObavestenja: 0,
        });
      });

    // ==================================================
    // BROJ OBAVEŠTENJA PO KATEGORIJI
    // ==================================================

    (data.data || []).forEach(
      (item: any) => {
        const categoryId =
          item.relationships
            ?.field_tip_obavestenja
            ?.data?.id;

        if (
          categoryId &&
          kategorije.has(categoryId)
        ) {
          const kategorija =
            kategorije.get(categoryId)!;

          kategorija.brojObavestenja++;
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
      "Server error fetching kategorije obaveštenja:",
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

// ==================================================
// POST
// ==================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      kategorija,
    } = body;

    // ==================================================
    // VALIDACIJA
    // ==================================================

    if (
      !title ||
      !description ||
      !kategorija
    ) {
      return NextResponse.json(
        {
          error:
            "Naslov, tekst i tip obaveštenja su obavezni.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // UZMI DRUPAL SESIJU TRENUTNO ULOGOVANOG KORISNIKA
    // ==================================================

    const cookieStore = await cookies();

    const allCookies = cookieStore.getAll();

    console.log(
      "COOKIES:",
      allCookies.map(
        (cookie) => cookie.name
      )
    );

    const drupalCookies = allCookies
      .filter(
        (cookie) =>
          cookie.name.startsWith("SESS") ||
          cookie.name.startsWith("SSESS")
      )
      .map(
        (cookie) =>
          `${cookie.name}=${cookie.value}`
      )
      .join("; ");

    console.log(
      "DRUPAL COOKIE:",
      drupalCookies
        ? "FOUND"
        : "NOT FOUND"
    );

    // ==================================================
    // NEMA DRUPAL SESIJE
    // ==================================================

    if (!drupalCookies) {
      return NextResponse.json(
        {
          error:
            "Drupal sesija nije pronađena. Prijavite se ponovo.",
        },
        { status: 401 }
      );
    }

    // ==================================================
    // CSRF TOKEN
    // ==================================================

    const csrfResponse = await fetch(
      `${DRUPAL_BASE_URL}/session/token`,
      {
        method: "GET",
        headers: {
          Cookie: drupalCookies,
          Accept: "text/plain",
        },
        cache: "no-store",
      }
    );

    if (!csrfResponse.ok) {
      const text =
        await csrfResponse.text();

      console.error(
        "Drupal CSRF error:",
        csrfResponse.status,
        text
      );

      return NextResponse.json(
        {
          error:
            "Nije moguće dobiti Drupal CSRF token.",
        },
        { status: 502 }
      );
    }

    const csrfToken =
      await csrfResponse.text();

    // ==================================================
    // CREATE OBAVEŠTENJE
    // ==================================================

    const createResponse = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/vnd.api+json",

          Accept:
            "application/vnd.api+json",

          Cookie: drupalCookies,

          "X-CSRF-Token":
            csrfToken,
        },

        body: JSON.stringify({
          data: {
            type: "node--obavestenje",

            attributes: {
              title,

              body: {
                value: description,
                format: "plain_text",
              },
            },

            relationships: {
              field_tip_obavestenja: {
                data: {
                  type:
                    "taxonomy_term--tip_obavestenja",

                  id: kategorija,
                },
              },
            },
          },
        }),
      }
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    const responseText =
      await createResponse.text();

    if (!createResponse.ok) {
      console.error(
        "Drupal create obavestenje error:",
        createResponse.status,
        responseText
      );

      let errorData: any = {};

      try {
        errorData = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        // Drupal nije vratio JSON
      }

      return NextResponse.json(
        {
          error:
            errorData?.errors?.[0]?.detail ||
            errorData?.error ||
            "Greška prilikom kreiranja obaveštenja.",
        },
        {
          status:
            createResponse.status,
        }
      );
    }

    let result: any = {};

    try {
      result = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      result = {};
    }

    return NextResponse.json(
      {
        data: result.data ?? null,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Server error creating obaveštenje:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Interna greška servera.",
      },
      { status: 500 }
    );
  }
}

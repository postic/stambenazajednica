import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

export async function POST(request: Request) {
  try {
    // ----------------------------------------------
    // 1. Podaci iz forme
    // ----------------------------------------------

    const { title, body } = await request.json();

    const cleanTitle = title?.toString().trim() || "";
    const cleanBody = body?.toString().trim() || "";

    // ----------------------------------------------
    // 2. Validacija
    // ----------------------------------------------

    if (!cleanTitle) {
      return NextResponse.json(
        {
          error: "Naslov je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    if (!cleanBody) {
      return NextResponse.json(
        {
          error: "Tekst je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // 3. Drupal cookies
    // ----------------------------------------------

    const cookieStore = await cookies();

    const drupalCookies = cookieStore
      .getAll()
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

    if (!drupalCookies) {
      return NextResponse.json(
        {
          error:
            "Drupal sesija nije pronađena. Potrebno je biti prijavljen.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // 4. CSRF token
    // ----------------------------------------------

    const csrfResponse = await fetch(
      `${DRUPAL_BASE_URL}/session/token`,
      {
        headers: {
          Cookie: drupalCookies,
        },
        cache: "no-store",
      }
    );

    if (!csrfResponse.ok) {
      const text = await csrfResponse.text();

      console.error(
        "Greška pri dohvatanju CSRF tokena:",
        text
      );

      return NextResponse.json(
        {
          error:
            "Nije moguće dobiti Drupal CSRF token.",
          details: text,
        },
        {
          status: csrfResponse.status,
        }
      );
    }

    const csrfToken = await csrfResponse.text();

    // ----------------------------------------------
    // 5. Kreiranje teme
    // ----------------------------------------------

    const createResponse = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_topic`,
      {
        method: "POST",

        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type":
            "application/vnd.api+json",
          Cookie: drupalCookies,
          "X-CSRF-Token": csrfToken,
        },

        body: JSON.stringify({
          data: {
            type: "node--forum_topic",

            attributes: {
              title: cleanTitle,

              body: {
                value: cleanBody,
                format: "plain_text",
              },
            },
          },
        }),
      }
    );

    // ----------------------------------------------
    // 6. Drupal odgovor
    // ----------------------------------------------

    const responseText =
      await createResponse.text();

    let responseData: any = null;

    try {
      responseData = responseText
        ? JSON.parse(responseText)
        : null;
    } catch {
      responseData = null;
    }

    if (!createResponse.ok) {
      console.error(
        "Drupal greška pri kreiranju teme:",
        responseText
      );

      return NextResponse.json(
        {
          error:
            responseData?.errors?.[0]?.detail ||
            responseData?.message ||
            "Greška pri kreiranju teme.",

          details:
            responseData ?? responseText,
        },
        {
          status: createResponse.status,
        }
      );
    }

    // ----------------------------------------------
    // 7. Uspeh
    // ----------------------------------------------

    const nodeData = responseData?.data;

    if (!nodeData?.id) {
      return NextResponse.json(
        {
          error:
            "Tema je kreirana, ali Drupal nije vratio UUID.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Forum tema uspešno kreirana:",
      nodeData.id
    );

    return NextResponse.json({
      success: true,
      data: nodeData,
    });
  } catch (error) {
    console.error(
      "Greška pri POST /api/forum/teme:",
      error
    );

    return NextResponse.json(
      {
        error: "Greška na serveru.",
        details: String(error),
      },
      {
        status: 500,
      }
    );
  }
}

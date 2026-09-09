import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// GET
// ==================================================

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

    if (!id) {
      return NextResponse.json(
        {
          error: "ID obaveštenja je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}?include=field_image,field_tip_obavestenja`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();

      return NextResponse.json(
        {
          error:
            "Greška pri učitavanju obaveštenja",
          details: text,
        },
        {
          status: response.status,
        }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Greška pri GET obaveštenja:",
      error
    );

    return NextResponse.json(
      {
        error: "Greška na serveru",
      },
      {
        status: 500,
      }
    );
  }
}

// ==================================================
// DELETE
// ==================================================

export async function DELETE(
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

    if (!id) {
      return NextResponse.json(
        {
          error: "ID obaveštenja je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // Drupal cookies
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
            "Drupal sesija nije pronađena.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // CSRF token
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

      return NextResponse.json(
        {
          error:
            "Nije moguće dobiti Drupal CSRF token",
          details: text,
        },
        {
          status: csrfResponse.status,
        }
      );
    }

    const csrfToken =
      await csrfResponse.text();

    // ----------------------------------------------
    // Brisanje obaveštenja
    // ----------------------------------------------

    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}`,
      {
        method: "DELETE",

        headers: {
          Accept: "application/vnd.api+json",
          Cookie: drupalCookies,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    if (response.status === 404) {
      return NextResponse.json(
        {
          error:
            "Obaveštenje nije pronađeno.",
        },
        {
          status: 404,
        }
      );
    }

    if (response.status === 401) {
      return NextResponse.json(
        {
          error:
            "Niste prijavljeni ili Drupal sesija nije validna.",
        },
        {
          status: 401,
        }
      );
    }

    if (!response.ok) {
      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      return NextResponse.json(
        {
          error:
            data?.errors?.[0]?.detail ||
            data?.message ||
            "Brisanje obaveštenja nije uspelo.",

          details: data ?? text,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Greška pri brisanju obaveštenja:",
      error
    );

    return NextResponse.json(
      {
        error: "Greška na serveru",
      },
      {
        status: 500,
      }
    );
  }
}

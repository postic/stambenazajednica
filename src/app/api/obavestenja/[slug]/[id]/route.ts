import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

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

    // ================================================
    // PROVERA ID-a
    // ================================================

    if (!id) {
      return NextResponse.json(
        {
          error: "ID obaveštenja je obavezan",
        },
        { status: 400 }
      );
    }

    // ================================================
    // COOKIES
    // ================================================

    const cookieStore = await cookies();

    const allCookies = cookieStore.getAll();

    console.log(
      "COOKIES:",
      allCookies.map((cookie) => cookie.name)
    );

    // ================================================
    // DRUPAL COOKIE
    // ================================================

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

    if (!drupalCookies) {
      return NextResponse.json(
        {
          error:
            "Drupal sesija nije pronađena",
        },
        { status: 401 }
      );
    }

    // ================================================
    // CSRF TOKEN
    // ================================================

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
      const text = await csrfResponse.text();

      console.error(
        "Drupal CSRF error:",
        csrfResponse.status,
        text
      );

      return NextResponse.json(
        {
          error:
            "Nije moguće dobiti Drupal CSRF token",
        },
        { status: 502 }
      );
    }

    const csrfToken =
      await csrfResponse.text();

    // ================================================
    // DELETE FROM DRUPAL
    // ================================================

    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/vnd.api+json",
          "X-CSRF-Token": csrfToken,
          Cookie: drupalCookies,
        },
      }
    );

    // ================================================
    // 404
    // ================================================

    if (response.status === 404) {
      return NextResponse.json(
        {
          error:
            "Obaveštenje nije pronađeno",
        },
        { status: 404 }
      );
    }

    // ================================================
    // 401
    // ================================================

    if (response.status === 401) {
      const text = await response.text();

      console.error(
        "Drupal DELETE 401:",
        text
      );

      return NextResponse.json(
        {
          error:
            "Drupal nije prihvatio autentifikaciju",
        },
        { status: 401 }
      );
    }

    // ================================================
    // OSTALI ERROR
    // ================================================

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "Drupal DELETE error:",
        response.status,
        text
      );

      return NextResponse.json(
        {
          error:
            "Greška prilikom brisanja obaveštenja",
        },
        { status: 502 }
      );
    }

    // ================================================
    // SUCCESS
    // ================================================

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Server error deleting obaveštenje:",
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

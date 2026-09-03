import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

interface AuthUser {
  uid: string;
  name: string;
  roles?: string[];
  picture?: string | null;
}

function getNextAuthUser(req: NextRequest): AuthUser | null {
  const cookie = req.cookies.get("next_auth")?.value;

  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
}

async function loginToDrupal() {
  const loginResponse = await fetch(
    `${DRUPAL_BASE_URL}/user/login?_format=json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: process.env.DRUPAL_API_USER,
        pass: process.env.DRUPAL_API_PASSWORD,
      }),
      cache: "no-store",
    }
  );

  if (!loginResponse.ok) {
    const text = await loginResponse.text();

    throw new Error(
      `Drupal login nije uspeo: ${loginResponse.status} ${text}`
    );
  }

  const cookies = loginResponse.headers.get("set-cookie");

  if (!cookies) {
    throw new Error("Drupal session cookie nije pronađen.");
  }

  const cookieHeader = cookies
    .split(",")
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

  const csrfResponse = await fetch(
    `${DRUPAL_BASE_URL}/session/token`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  if (!csrfResponse.ok) {
    throw new Error("Drupal CSRF token nije pronađen.");
  }

  const csrfToken = await csrfResponse.text();

  return {
    cookieHeader,
    csrfToken,
  };
}

async function parseDrupalResponse(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error("Drupal nije vratio JSON:", text);

    throw new Error(
      `Drupal je vratio neispravan odgovor: ${text.substring(0, 300)}`
    );
  }
}

async function findProstor(
  uid: string,
  cookieHeader: string
) {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/node/prostor` +
    `?filter[field_prostor_user.meta.drupal_internal__target_id]=${encodeURIComponent(
      uid
    )}` +
    `&page[limit]=1`;

  console.log("Tražim Prostor za Drupal UID:", uid);
  console.log("Drupal URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const data = await parseDrupalResponse(response);

  if (!response.ok) {
    console.error("Drupal pronalaženje Prostora:", data);

    throw new Error(
      `Greška pri pronalaženju Prostora: ${response.status}`
    );
  }

  if (!data.data || data.data.length === 0) {
    return null;
  }

  return data.data[0];
}

/**
 * GET /api/podesavanja/kontakt
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = getNextAuthUser(req);

    if (!authUser?.uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Korisnik nije prijavljen.",
        },
        {
          status: 401,
        }
      );
    }

    const { cookieHeader } = await loginToDrupal();

    const prostor = await findProstor(
      authUser.uid,
      cookieHeader
    );

    if (!prostor) {
      console.error(
        `Prostor nije pronađen za UID ${authUser.uid}`
      );

      return NextResponse.json(
        {
          success: false,
          error: "Prostor nije pronađen.",
          uid: authUser.uid,
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "Prostor pronađen:",
      prostor.id
    );

    const attributes = prostor.attributes || {};

    console.log(
      "Drupal field_prostor_email:",
      attributes.field_prostor_email
    );

    console.log(
      "Drupal field_prostor_telefon:",
      attributes.field_prostor_telefon
    );

    /*
     * Email je Drupal field tipa "email".
     *
     * Čitamo direktno vrednost iz attributes.
     */
    const email =
      typeof attributes.field_prostor_email === "string"
        ? attributes.field_prostor_email
        : "";

    /*
     * Telefon je string.
     */
    const telefon =
      typeof attributes.field_prostor_telefon === "string"
        ? attributes.field_prostor_telefon
        : "";

    console.log("Konačan email koji šaljem Next.js-u:", email);
    console.log("Konačan telefon koji šaljem Next.js-u:", telefon);

    return NextResponse.json({
      success: true,
      data: {
        id: prostor.id,
        field_prostor_email: email,
        field_prostor_telefon: telefon,
      },
    });
  } catch (error) {
    console.error(
      "Kontakt podaci GET:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Greška pri učitavanju kontakt podataka.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * PATCH /api/podesavanja/kontakt
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = getNextAuthUser(req);

    if (!authUser?.uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Korisnik nije prijavljen.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const email = String(
      body.field_prostor_email ?? ""
    ).trim();

    const telefon = String(
      body.field_prostor_telefon ?? ""
    ).trim();

    /*
     * Jednostavna provera email adrese.
     */
    if (email && !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unesi ispravnu email adresu.",
        },
        {
          status: 400,
        }
      );
    }

    const { cookieHeader, csrfToken } =
      await loginToDrupal();

    const prostor = await findProstor(
      authUser.uid,
      cookieHeader
    );

    if (!prostor) {
      console.error(
        `Prostor nije pronađen za UID ${authUser.uid}`
      );

      return NextResponse.json(
        {
          success: false,
          error: "Prostor nije pronađen.",
          uid: authUser.uid,
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "Ažuriram Prostor:",
      prostor.id
    );

    console.log(
      "Novi email:",
      email
    );

    console.log(
      "Novi telefon:",
      telefon
    );

    const updateResponse = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/prostor/${prostor.id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type":
            "application/vnd.api+json",
          Cookie: cookieHeader,
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          data: {
            type: "node--prostor",
            id: prostor.id,
            attributes: {
              field_prostor_email: email,
              field_prostor_telefon: telefon,
            },
          },
        }),
        cache: "no-store",
      }
    );

    const updateData =
      await parseDrupalResponse(
        updateResponse
      );

    if (!updateResponse.ok) {
      console.error(
        "Drupal PATCH prostor:",
        updateData
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Greška pri čuvanju kontakt podataka.",
          details: updateData,
        },
        {
          status: updateResponse.status,
        }
      );
    }

    const updatedAttributes =
      updateData.data?.attributes || {};

    const savedEmail =
      typeof updatedAttributes.field_prostor_email ===
      "string"
        ? updatedAttributes.field_prostor_email
        : email;

    const savedTelefon =
      typeof updatedAttributes.field_prostor_telefon ===
      "string"
        ? updatedAttributes.field_prostor_telefon
        : telefon;

    console.log(
      "Sačuvan email:",
      savedEmail
    );

    console.log(
      "Sačuvan telefon:",
      savedTelefon
    );

    return NextResponse.json({
      success: true,
      message:
        "Kontakt podaci su sačuvani.",
      data: {
        id: prostor.id,
        field_prostor_email: savedEmail,
        field_prostor_telefon: savedTelefon,
      },
    });
  } catch (error) {
    console.error(
      "Kontakt podaci PATCH:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Greška pri čuvanju kontakt podataka.",
      },
      {
        status: 500,
      }
    );
  }
}

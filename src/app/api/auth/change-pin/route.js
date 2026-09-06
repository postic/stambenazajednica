import { NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// =========================================================
// NEXT AUTH USER
// =========================================================

function getNextAuthUser(req) {
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

// =========================================================
// DRUPAL LOGIN
// =========================================================

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

  // =======================================================
  // CSRF TOKEN
  // =======================================================

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

// =========================================================
// PARSE DRUPAL RESPONSE
// =========================================================

async function parseDrupalResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error("Drupal nije vratio JSON:", text);

    throw new Error(
      `Drupal je vratio neispravan odgovor: ${text.substring(
        0,
        300
      )}`
    );
  }
}

// =========================================================
// FIND PROSTOR
// =========================================================

async function findProstor(uid, cookieHeader) {
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

// =========================================================
// CHECK PIN UNIQUE
// =========================================================

async function isPinAlreadyUsed(
  pin,
  currentProstorId,
  cookieHeader
) {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/node/prostor` +
    `?filter[field_prostor_pin]=${encodeURIComponent(
      pin
    )}` +
    `&page[limit]=50`;

  console.log(
    "Proveravam da li PIN već postoji."
  );

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
    console.error(
      "Drupal provera jedinstvenosti PIN-a:",
      data
    );

    throw new Error(
      `Greška pri proveri jedinstvenosti PIN-a: ${response.status}`
    );
  }

  const prostori = data.data || [];

  return prostori.some(
    (item) => item.id !== currentProstorId
  );
}

// =========================================================
// POST - CHANGE PIN
// =========================================================

export async function POST(req) {
  try {
    // =======================================================
    // PROVERA PRIJAVLJENOG KORISNIKA
    // =======================================================

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

    // =======================================================
    // BODY
    // =======================================================

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Neispravan zahtev.",
        },
        {
          status: 400,
        }
      );
    }

    const trenutniPin = String(
      body.trenutniPin ?? ""
    );

    const noviPin = String(
      body.noviPin ?? ""
    );

    // =======================================================
    // OSNOVNA VALIDACIJA
    // =======================================================

    if (!trenutniPin || !noviPin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Trenutni i novi PIN su obavezni.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // DOZVOLJENI KARAKTERI
    // =======================================================

    if (!/^[a-zA-Z0-9]+$/.test(trenutniPin)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PIN može sadržati samo slova i cifre.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[a-zA-Z0-9]+$/.test(noviPin)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PIN može sadržati samo slova i cifre.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // DUŽINA PIN-A
    // =======================================================

    if (noviPin.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PIN mora imati najmanje 4 karaktera.",
        },
        {
          status: 400,
        }
      );
    }

    if (noviPin.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PIN može imati najviše 20 karaktera.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // NE MOŽE ISTI PIN
    // =======================================================

    if (trenutniPin === noviPin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Novi PIN mora biti drugačiji od trenutnog PIN-a.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // DRUPAL LOGIN
    // =======================================================

    const {
      cookieHeader,
      csrfToken,
    } = await loginToDrupal();

    // =======================================================
    // FIND PROSTOR
    // =======================================================

    const prostor = await findProstor(
      String(authUser.uid),
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

    // =======================================================
    // CURRENT PIN FROM DRUPAL
    // =======================================================

    const attributes = prostor.attributes || {};

    const trenutniPinIzBaze = String(
      attributes.field_prostor_pin ?? ""
    );

    // =======================================================
    // CHECK CURRENT PIN
    // =======================================================

    if (
      trenutniPinIzBaze !== trenutniPin
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Trenutni PIN nije ispravan.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // CHECK NEW PIN UNIQUE
    // =======================================================

    const pinAlreadyUsed =
      await isPinAlreadyUsed(
        noviPin,
        prostor.id,
        cookieHeader
      );

    if (pinAlreadyUsed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ovaj PIN već koristi drugi korisnik. Izaberite drugi.",
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // UPDATE PIN
    // =======================================================

    console.log(
      "Menjam field_prostor_pin za Prostor:",
      prostor.id
    );

    const updateResponse = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/prostor/${prostor.id}`,
      {
        method: "PATCH",

        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Cookie: cookieHeader,
          "X-CSRF-Token": csrfToken,
        },

        body: JSON.stringify({
          data: {
            type: "node--prostor",
            id: prostor.id,

            attributes: {
              field_prostor_pin: noviPin,
            },
          },
        }),

        cache: "no-store",
      }
    );

    const updateData =
      await parseDrupalResponse(updateResponse);

    if (!updateResponse.ok) {
      console.error(
        "Drupal PATCH PIN:",
        updateData
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Greška pri čuvanju novog PIN-a.",
          details: updateData,
        },
        {
          status: updateResponse.status,
        }
      );
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    console.log(
      "PIN uspešno promenjen za Prostor:",
      prostor.id
    );

    return NextResponse.json({
      success: true,
      message:
        "PIN je uspešno promenjen.",
    });
  } catch (error) {
    console.error(
      "Promena PIN-a:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Greška pri promeni PIN-a.",
      },
      {
        status: 500,
      }
    );
  }
}

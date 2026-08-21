import type { Kvar } from "@/types/kvar";
import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// next_auth
// ==================================================

function getNextAuthUser(req: NextRequest) {
  const cookie = req.cookies.get("next_auth");

  if (!cookie?.value) {
    return null;
  }

  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

// ==================================================
// Drupal login
// ==================================================

async function loginToDrupal() {
  try {
    // --------------------------------------------------
    // 1. Login
    // --------------------------------------------------

    const loginResponse = await fetch(
      `${DRUPAL_BASE_URL}/user/login?_format=json`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          name: process.env.DRUPAL_API_USER,
          pass: process.env.DRUPAL_API_PASSWORD,
        }),

        cache: "no-store",
      }
    );

    const loginText =
      await loginResponse.text();

    let loginData: any;

    try {
      loginData =
        JSON.parse(loginText);
    } catch {
      loginData =
        loginText;
    }

    console.log(
      "Drupal login status:",
      loginResponse.status
    );

    if (!loginResponse.ok) {
      console.error(
        "Drupal login error:",
        JSON.stringify(
          loginData,
          null,
          2
        )
      );

      return null;
    }

    // --------------------------------------------------
    // 2. Session cookie
    // --------------------------------------------------

    let drupalCookie = "";

    if (
      typeof loginResponse.headers
        .getSetCookie ===
      "function"
    ) {
      const cookies =
        loginResponse.headers.getSetCookie();

      if (cookies.length > 0) {
        drupalCookie =
          cookies
            .map(
              (cookie) =>
                cookie
                  .split(";")[0]
                  .trim()
            )
            .join("; ");
      }
    }

    // --------------------------------------------------
    // Fallback
    // --------------------------------------------------

    if (!drupalCookie) {
      const setCookie =
        loginResponse.headers.get(
          "set-cookie"
        );

      if (setCookie) {
        drupalCookie =
          setCookie
            .split(";")[0]
            .trim();
      }
    }

    if (!drupalCookie) {
      console.error(
        "Drupal nije vratio session cookie"
      );

      return null;
    }

    console.log(
      "Drupal Cookie:",
      drupalCookie
    );

    // --------------------------------------------------
    // 3. CSRF token
    // --------------------------------------------------

    const csrfResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/session/token`,
        {
          method: "GET",

          headers: {
            Cookie:
              drupalCookie,

            Accept:
              "text/plain",
          },

          cache: "no-store",
        }
      );

    const csrfToken =
      await csrfResponse.text();

    console.log(
      "Drupal CSRF status:",
      csrfResponse.status
    );

    if (!csrfResponse.ok) {
      console.error(
        "Drupal CSRF error:",
        csrfToken
      );

      return null;
    }

    if (!csrfToken) {
      console.error(
        "Drupal CSRF token je prazan"
      );

      return null;
    }

    return {
      drupalCookie,
      csrfToken,
    };
  } catch (error) {
    console.error(
      "Drupal login exception:",
      error
    );

    return null;
  }
}

// ==================================================
// Helper
// ==================================================

async function parseDrupalResponse(
  response: Response
) {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ==================================================
// GET
// ==================================================

export async function GET(
  req: NextRequest
) {
  try {
    const authUser =
      getNextAuthUser(req);

    if (!authUser?.uid) {
      return NextResponse.json(
        {
          error:
            "Korisnik nije prijavljen",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } =
      new URL(req.url);

    const page = Math.max(
      parseInt(
        searchParams.get("page") ||
          "1"
      ),
      1
    );

    const limit = Math.max(
      parseInt(
        searchParams.get("limit") ||
          "10"
      ),
      1
    );

    const offset =
      (page - 1) * limit;

    // --------------------------------------------------
    // Drupal GET
    // --------------------------------------------------

    const response =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/kvar?sort=-created&include=field_image`,
        {
          headers: {
            Accept:
              "application/vnd.api+json",
          },

          cache: "no-store",
        }
      );

    const data =
      await parseDrupalResponse(
        response
      );

    if (!response.ok) {
      console.error(
        "Drupal GET kvarovi error:",
        response.status,
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            "Greška pri dohvaćanju kvarova",

          details:
            data,
        },
        {
          status: 502,
        }
      );
    }

    const allItems =
      Array.isArray(data?.data)
        ? data.data
        : [];

    const total =
      allItems.length;

    const totalPages =
      Math.ceil(
        total / limit
      );

    const currentPageData =
      allItems.slice(
        offset,
        offset + limit
      );

    // --------------------------------------------------
    // Map
    // --------------------------------------------------

    const kvarovi: Kvar[] =
      currentPageData.map(
        (item: any) => {

          let imageUrl:
            | string
            | null = null;

          const imageRel =
            item.relationships
              ?.field_image
              ?.data?.[0];

          if (
            imageRel &&
            Array.isArray(
              data?.included
            )
          ) {
            const fileObj =
              data.included.find(
                (i: any) =>
                  i.type ===
                    "file--file" &&
                  i.id ===
                    imageRel.id
              );

            const fileUriValue =
              fileObj
                ?.attributes
                ?.uri
                ?.value;

            if (fileUriValue) {
              const filePath =
                fileUriValue.replace(
                  "public://",
                  "/sites/default/files/"
                );

              imageUrl =
                `${DRUPAL_BASE_URL}${filePath}`;
            }
          }

          return {
            id:
              item.id,

            title:
              item.attributes
                ?.title ??
              "",

            body:
              item.attributes
                ?.body?.value ??
              "",

            created:
              item.attributes
                ?.created ??
              "",

            status:
              item.attributes
                ?.field_status_kvara ??
              "",

            prioritet:
              item.attributes
                ?.field_prioritet_kvara ??
              "",

            image:
              imageUrl,
          };
        }
      );

    return NextResponse.json({
      data: kvarovi,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error(
      "Kvarovi GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Interna greška servera",
      },
      {
        status: 500,
      }
    );
  }
}

// ==================================================
// POST
// Kreiranje kvara
// ==================================================

export async function POST(
  req: NextRequest
) {
  try {
    // --------------------------------------------------
    // 1. Provera korisnika
    // --------------------------------------------------

    const authUser =
      getNextAuthUser(req);

    if (!authUser?.uid) {
      return NextResponse.json(
        {
          error:
            "Korisnik nije prijavljen",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "Kvar POST - UID:",
      authUser.uid
    );

    // --------------------------------------------------
    // 2. Body
    // --------------------------------------------------

    const body =
      await req.json();

    const title =
      typeof body?.title ===
      "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body?.description ===
      "string"
        ? body.description.trim()
        : "";

    const prioritet =
      typeof body?.prioritet ===
      "string"
        ? body.prioritet.trim()
        : "";

    const status =
      typeof body?.status ===
      "string"
        ? body.status.trim()
        : "";

    // --------------------------------------------------
    // 3. Validacija
    // --------------------------------------------------

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Naslov kvara je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          error:
            "Opis kvara je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    if (!prioritet) {
      return NextResponse.json(
        {
          error:
            "Prioritet kvara je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          error:
            "Status kvara je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 4. Drupal login
    // --------------------------------------------------

    const drupalAuth =
      await loginToDrupal();

    if (!drupalAuth) {
      return NextResponse.json(
        {
          error:
            "Drupal login neuspešan",
        },
        {
          status: 401,
        }
      );
    }

    const {
      drupalCookie,
      csrfToken,
    } = drupalAuth;

    console.log(
      "Drupal authentication uspešna"
    );

    // --------------------------------------------------
    // 5. Kreiranje noda
    // --------------------------------------------------

    const response =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/kvar`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/vnd.api+json",

            "Content-Type":
              "application/vnd.api+json",

            Cookie:
              drupalCookie,

            "X-CSRF-Token":
              csrfToken,
          },

          body: JSON.stringify({
            data: {
              type:
                "node--kvar",

              attributes: {
                title,

                body: {
                  value:
                    description,

                  format:
                    "plain_text",
                },

                field_prioritet_kvara:
                  prioritet,

                field_status_kvara:
                  status,
              },
            },
          }),

          cache: "no-store",
        }
      );

    const data =
      await parseDrupalResponse(
        response
      );

    // --------------------------------------------------
    // 6. Greška
    // --------------------------------------------------

    if (!response.ok) {
      console.error(
        "Drupal CREATE kvar error:",
        response.status,
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            "Greška pri kreiranju kvara",

          details:
            data,
        },
        {
          status:
            response.status,
        }
      );
    }

    // --------------------------------------------------
    // 7. Uspešno
    // --------------------------------------------------

    console.log(
      "Kvar uspešno kreiran:",
      data?.data?.id
    );

    return NextResponse.json(
      data,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Kvar POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Interna greška servera",
      },
      {
        status: 500,
      }
    );
  }
}

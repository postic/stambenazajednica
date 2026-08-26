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

    if (!loginResponse.ok) {
      console.error(
        "Drupal login error:",
        loginResponse.status,
        loginData
      );

      return null;
    }

    // --------------------------------------------------
    // Session cookie
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

    // --------------------------------------------------
    // CSRF
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

    if (!csrfResponse.ok) {
      console.error(
        "Drupal CSRF error:",
        csrfResponse.status,
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
// Drupal response helper
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
// Drupal USER UUID
//
// next_auth uid = Drupal numeric UID
// JSON:API uid relationship = Drupal UUID
// ==================================================

async function getDrupalUserUuid(
  uid: string | number,
  drupalCookie: string
) {
  try {
    const response =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/user/user?filter[uid]=${encodeURIComponent(
          uid.toString()
        )}`,
        {
          method: "GET",

          headers: {
            Accept:
              "application/vnd.api+json",

            Cookie:
              drupalCookie,
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
        "Drupal user lookup error:",
        response.status,
        data
      );

      return null;
    }

    const user =
      Array.isArray(data?.data)
        ? data.data[0]
        : null;

    if (!user?.id) {
      console.error(
        "Drupal korisnik nije pronađen:",
        uid
      );

      return null;
    }

    return user.id;
  } catch (error) {
    console.error(
      "getDrupalUserUuid error:",
      error
    );

    return null;
  }
}

// ==================================================
// GET
//
// /api/moji-kvarovi
// /api/moji-kvarovi?page=1&limit=10
// ==================================================

export async function GET(
  req: NextRequest
) {
  try {
    // --------------------------------------------------
    // 1. Trenutni korisnik
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

    // --------------------------------------------------
    // 2. Query
    // --------------------------------------------------

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
    // 3. Drupal login
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
    } = drupalAuth;

    // --------------------------------------------------
    // 4. UUID trenutnog korisnika
    // --------------------------------------------------

    const userUuid =
      await getDrupalUserUuid(
        authUser.uid,
        drupalCookie
      );

    if (!userUuid) {
      return NextResponse.json(
        {
          error:
            "Nije moguće pronaći trenutnog korisnika u Drupalu",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "Moji kvarovi - korisnik:",
      {
        uid:
          authUser.uid,

        uuid:
          userUuid,
      }
    );

    // --------------------------------------------------
    // 5. Drupal GET
    //
    // Filter:
    // uid.id = UUID trenutnog korisnika
    // --------------------------------------------------

    const drupalUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/kvar` +
      `?sort=-created` +
      `&include=field_image,uid` +
      `&filter[uid.id]=${encodeURIComponent(
        userUuid
      )}`;

    console.log(
      "Moji kvarovi Drupal URL:",
      drupalUrl
    );

    const response =
      await fetch(
        drupalUrl,
        {
          method: "GET",

          headers: {
            Accept:
              "application/vnd.api+json",

            Cookie:
              drupalCookie,
          },

          cache: "no-store",
        }
      );

    const data =
      await parseDrupalResponse(
        response
      );

    // --------------------------------------------------
    // 6. Drupal error
    // --------------------------------------------------

    if (!response.ok) {
      console.error(
        "Drupal GET moji kvarovi error:",
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
            "Greška pri dohvaćanju mojih kvarova",

          details:
            data,
        },
        {
          status: 502,
        }
      );
    }

    // --------------------------------------------------
    // 7. Data
    // --------------------------------------------------

    const allItems =
      Array.isArray(data?.data)
        ? data.data
        : [];

    const included =
      Array.isArray(data?.included)
        ? data.included
        : [];

    // --------------------------------------------------
    // 8. Pagination
    // --------------------------------------------------

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
    // 9. Map
    // --------------------------------------------------

    const kvarovi: Kvar[] =
      currentPageData.map(
        (item: any) => {

          // --------------------------------------------
          // IMAGE
          // --------------------------------------------

          let imageUrl:
            | string
            | null = null;

          const imageRel =
            item.relationships
              ?.field_image
              ?.data?.[0];

          if (
            imageRel &&
            included.length > 0
          ) {
            const fileObj =
              included.find(
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

          // --------------------------------------------
          // RETURN
          // --------------------------------------------

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

    // --------------------------------------------------
    // 10. Response
    // --------------------------------------------------

    return NextResponse.json({
      data:
        kvarovi,

      total,

      page,

      totalPages,
    });
  } catch (error) {
    console.error(
      "Moji kvarovi GET error:",
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

import type { Obavestenje } from "@/types/obavestenje";
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

    console.log(
      "Drupal login status:",
      loginResponse.status
    );

    if (!loginResponse.ok) {
      console.error(
        "Drupal login error:",
        loginData
      );

      return null;
    }

    // ==================================================
    // Session cookie
    // ==================================================

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

    // Fallback

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

    // ==================================================
    // CSRF token
    // ==================================================

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

    console.log(
      "Drupal user pronađen:",
      {
        uid,
        uuid:
          user.id,
        name:
          user.attributes?.name,
      }
    );

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
// /api/moja-obavestenja
// /api/moja-obavestenja?page=1&limit=10
// ==================================================

export async function GET(
  req: NextRequest
) {
  try {
    // ==================================================
    // 1. Trenutni korisnik
    // ==================================================

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
      "=========================================="
    );

    console.log(
      "MOJA OBAVEŠTENJA"
    );

    console.log(
      "NEXT AUTH USER:",
      authUser
    );

    // ==================================================
    // 2. Query
    // ==================================================

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

    // ==================================================
    // 3. Drupal login
    // ==================================================

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

    // ==================================================
    // 4. Pronađi Drupal UUID korisnika
    // ==================================================

    const currentUserUuid =
      await getDrupalUserUuid(
        authUser.uid,
        drupalCookie
      );

    if (!currentUserUuid) {
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
      "CURRENT USER UUID:",
      currentUserUuid
    );

    // ==================================================
    // 5. Dohvati obaveštenja sa uid relationship
    // ==================================================

    const drupalUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje` +
      `?sort=-created` +
      `&include=field_image,uid`;

    console.log(
      "DRUPAL URL:",
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

    if (!response.ok) {
      console.error(
        "Drupal GET obavestenja error:",
        response.status,
        data
      );

      return NextResponse.json(
        {
          error:
            "Greška pri dohvaćanju obaveštenja",

          details:
            data,
        },
        {
          status: 502,
        }
      );
    }

    // ==================================================
    // 6. Data
    // ==================================================

    const allItems =
      Array.isArray(data?.data)
        ? data.data
        : [];

    const included =
      Array.isArray(data?.included)
        ? data.included
        : [];

    // ==================================================
    // 7. DEBUG - prikaži autore
    // ==================================================

    console.log(
      "OBAVEŠTENJA I AUTORI:"
    );

    allItems.forEach(
      (item: any) => {
        console.log({
          id:
            item.id,

          title:
            item.attributes
              ?.title,

          uidRelationship:
            item.relationships
              ?.uid,

          authorUuid:
            item.relationships
              ?.uid
              ?.data
              ?.id,
        });
      }
    );

    // ==================================================
    // 8. FILTER - SAMO TRENUTNI KORISNIK
    // ==================================================

    const myItems =
      allItems.filter(
        (item: any) => {
          const authorUuid =
            item.relationships
              ?.uid
              ?.data
              ?.id;

          const isMine =
            Boolean(
              authorUuid &&
              currentUserUuid &&
              authorUuid ===
                currentUserUuid
            );

          console.log(
            "FILTER:",
            {
              title:
                item.attributes
                  ?.title,

              authorUuid,

              currentUserUuid,

              isMine,
            }
          );

          return isMine;
        }
      );

    console.log(
      "UKUPNO OBAVEŠTENJA:",
      allItems.length
    );

    console.log(
      "MOJA OBAVEŠTENJA:",
      myItems.length
    );

    // ==================================================
    // 9. Pagination
    // ==================================================

    const total =
      myItems.length;

    const totalPages =
      Math.max(
        Math.ceil(
          total / limit
        ),
        1
      );

    const offset =
      (page - 1) * limit;

    const currentPageData =
      myItems.slice(
        offset,
        offset + limit
      );

    // ==================================================
    // 10. Map
    // ==================================================

    const obavestenja:
      Obavestenje[] =
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
          // AUTHOR
          // --------------------------------------------

          const authorRel =
            item.relationships
              ?.uid
              ?.data;

          let authorName:
            | string
            | null = null;

          if (
            authorRel &&
            included.length > 0
          ) {
            const authorObj =
              included.find(
                (i: any) =>
                  i.type ===
                    "user--user" &&
                  i.id ===
                    authorRel.id
              );

            if (
              authorObj
                ?.attributes
                ?.name
            ) {
              authorName =
                authorObj.attributes.name;
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

            author:
              authorName,

            image:
              imageUrl,
          };
        }
      );

    // ==================================================
    // 11. Response
    // ==================================================

    return NextResponse.json({
      data:
        obavestenja,

      total,

      page,

      totalPages,
    });
  } catch (error) {
    console.error(
      "Moja obavestenja GET error:",
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

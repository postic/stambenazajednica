import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// TYPES
// ==================================================

interface Obavestenje {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string | null;
  author?: string | null;
}

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
        loginData
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
// authUser.uid = Drupal numeric UID
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

    console.log(
      "Drupal user pronađen:",
      {
        uid,
        uuid: user.id,
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
// /api/obavestenja
// /api/obavestenja?page=1&limit=5
// /api/obavestenja?id=UUID
// /api/obavestenja?mine=1
// /api/obavestenja?mine=1&page=1&limit=10
// ==================================================

export async function GET(
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

    // --------------------------------------------------
    // 2. Query
    // --------------------------------------------------

    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    const mine =
      searchParams.get("mine") === "1";

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
          "5"
      ),
      1
    );

    // --------------------------------------------------
    // 3. Single
    // --------------------------------------------------

    if (id) {
      const response =
        await fetch(
          `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${encodeURIComponent(
            id
          )}?include=uid`,
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
          "Drupal GET obavestenje error:",
          response.status,
          data
        );

        return NextResponse.json(
          {
            error:
              "Greška pri učitavanju obaveštenja",

            details:
              data,
          },
          {
            status:
              response.status,
          }
        );
      }

      return NextResponse.json(
        data
      );
    }

    // --------------------------------------------------
    // 4. Ako tražimo samo moja obaveštenja
    // --------------------------------------------------

    let drupalUserUuid:
      string | null = null;

    let drupalCookie:
      string | null = null;

    if (mine) {
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

      drupalCookie =
        drupalAuth.drupalCookie;

      drupalUserUuid =
        await getDrupalUserUuid(
          authUser.uid,
          drupalCookie
        );

      if (!drupalUserUuid) {
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
    }

    // --------------------------------------------------
    // 5. Drupal URL
    // --------------------------------------------------

    let drupalUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje?sort=-created&include=field_image,uid`;

    // --------------------------------------------------
    // FILTER PO TRENUTNOM KORISNIKU
    // --------------------------------------------------

    if (
      mine &&
      drupalUserUuid
    ) {
      drupalUrl +=
        `&filter[uid.id]=${encodeURIComponent(
          drupalUserUuid
        )}`;
    }

    console.log(
      "Drupal obavestenja URL:",
      drupalUrl
    );

    // --------------------------------------------------
    // 6. Lista
    // --------------------------------------------------

    const response =
      await fetch(
        drupalUrl,
        {
          headers: {
            Accept:
              "application/vnd.api+json",

            ...(drupalCookie
              ? {
                  Cookie:
                    drupalCookie,
                }
              : {}),
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
            "Greška pri učitavanju obaveštenja",

          details:
            data,
        },
        {
          status:
            response.status,
        }
      );
    }

    const allData =
      Array.isArray(data?.data)
        ? data.data
        : [];

    const included =
      Array.isArray(data?.included)
        ? data.included
        : [];

    // --------------------------------------------------
    // 7. Pagination
    // --------------------------------------------------

    const total =
      allData.length;

    const totalPages =
      Math.ceil(
        total / limit
      );

    const offset =
      (page - 1) * limit;

    const currentPageData =
      allData.slice(
        offset,
        offset + limit
      );

    // --------------------------------------------------
    // 8. Map
    // --------------------------------------------------

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
              fileObj?.attributes
                ?.uri?.value;

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
              authorObj?.attributes?.name
            ) {
              authorName =
                authorObj.attributes.name;
            }
          }

          // --------------------------------------------
          // DEBUG
          // --------------------------------------------

          console.log(
            "OBAVESTENJE AUTHOR:",
            {
              title:
                item.attributes
                  ?.title,

              relationship:
                item.relationships
                  ?.uid,

              author:
                authorName,
            }
          );

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

    // --------------------------------------------------
    // 9. Response
    // --------------------------------------------------

    return NextResponse.json({
      data:
        obavestenja,

      total,

      page,

      totalPages,
    });
  } catch (error) {
    console.error(
      "Obavestenja GET error:",
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
//
// Kreiranje obaveštenja
// Autor = trenutno ulogovani korisnik
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
      "NEXT_AUTH USER:",
      {
        uid:
          authUser.uid,

        name:
          authUser.name,
      }
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

    const content =
      typeof body?.body ===
      "string"
        ? body.body.trim()
        : "";

    // --------------------------------------------------
    // 3. Validacija
    // --------------------------------------------------

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Naslov obaveštenja je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Tekst obaveštenja je obavezan",
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
    } =
      drupalAuth;

    // --------------------------------------------------
    // 5. UUID trenutno ulogovanog korisnika
    // --------------------------------------------------

    const authorUuid =
      await getDrupalUserUuid(
        authUser.uid,
        drupalCookie
      );

    if (!authorUuid) {
      return NextResponse.json(
        {
          error:
            "Nije moguće pronaći trenutno ulogovanog korisnika u Drupalu",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 6. Drupal POST
    // --------------------------------------------------

    const response =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje`,
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
                "node--obavestenje",

              attributes: {
                title,

                body: {
                  value:
                    content,

                  format:
                    "plain_text",
                },
              },

              // ------------------------------------------
              // DEFAULT DRUPAL AUTHOR
              // ------------------------------------------

              relationships: {
                uid: {
                  data: {
                    type:
                      "user--user",

                    id:
                      authorUuid,
                  },
                },
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
    // 7. Greška
    // --------------------------------------------------

    if (!response.ok) {
      console.error(
        "Drupal CREATE obavestenje error:",
        response.status,
        data
      );

      return NextResponse.json(
        {
          error:
            "Greška pri kreiranju obaveštenja",

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
    // 8. Uspeh
    // --------------------------------------------------

    console.log(
      "Obavestenje uspešno kreirano:",
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
      "Obavestenja POST error:",
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
// PATCH
//
// Izmena obaveštenja
// ==================================================

export async function PATCH(
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
      "Obavestenje PATCH - UID:",
      authUser.uid
    );

    // --------------------------------------------------
    // 2. Body
    // --------------------------------------------------

    const body =
      await req.json();

    const id =
      typeof body?.id ===
      "string"
        ? body.id.trim()
        : "";

    const title =
      typeof body?.title ===
      "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body?.body ===
      "string"
        ? body.body.trim()
        : "";

    // --------------------------------------------------
    // 3. Validacija
    // --------------------------------------------------

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID obaveštenja je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Naslov obaveštenja je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Tekst obaveštenja je obavezan",
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
    } =
      drupalAuth;

    // --------------------------------------------------
    // 5. PATCH Drupal
    // --------------------------------------------------

    const response =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${encodeURIComponent(
          id
        )}`,
        {
          method: "PATCH",

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
                "node--obavestenje",

              id,

              attributes: {
                title,

                body: {
                  value:
                    content,

                  format:
                    "plain_text",
                },
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
        "Drupal PATCH obavestenje error:",
        response.status,
        data
      );

      return NextResponse.json(
        {
          error:
            "Greška pri izmeni obaveštenja",

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
    // 7. Uspeh
    // --------------------------------------------------

    console.log(
      "Obavestenje uspešno izmenjeno:",
      id
    );

    return NextResponse.json(
      data
    );
  } catch (error) {
    console.error(
      "Obavestenja PATCH error:",
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

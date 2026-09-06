import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

interface Obavestenje {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string | null;
  author?: string | null;
}

// ==================================================
// AUTH
// ==================================================

function getNextAuthUser(
  req: NextRequest
) {
  const cookie =
    req.cookies.get("next_auth");

  if (!cookie?.value) {
    return null;
  }

  try {
    return JSON.parse(
      cookie.value
    );
  } catch {
    return null;
  }
}

// ==================================================
// DRUPAL LOGIN
// ==================================================

async function loginToDrupal() {
  try {
    const loginResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/user/login?_format=json`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            name:
              process.env
                .DRUPAL_API_USER,

            pass:
              process.env
                .DRUPAL_API_PASSWORD,
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

    let drupalCookie = "";

    if (
      typeof loginResponse
        .headers.getSetCookie ===
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
// PARSE DRUPAL RESPONSE
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
// GET DRUPAL USER UUID
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
// GET NOTIFICATION AUTHOR
// ==================================================

async function getObavestenjeAuthorUuid(
  id: string,
  drupalCookie: string
) {
  try {
    const response =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${encodeURIComponent(
          id
        )}?include=uid`,
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

    if (
      response.status === 404 ||
      !data?.data
    ) {
      return {
        exists: false,
        authorUuid: null,
      };
    }

    if (!response.ok) {
      console.error(
        "Drupal notification lookup error:",
        response.status,
        data
      );

      return {
        exists: false,
        authorUuid: null,
        error: true,
      };
    }

    const authorUuid =
      data.data.relationships
        ?.uid?.data?.id ??
      null;

    return {
      exists: true,
      authorUuid,
    };
  } catch (error) {
    console.error(
      "getObavestenjeAuthorUuid error:",
      error
    );

    return {
      exists: false,
      authorUuid: null,
      error: true,
    };
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
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    const page = Math.max(
      parseInt(
        searchParams.get(
          "page"
        ) || "1"
      ),
      1
    );

    const limit = Math.max(
      parseInt(
        searchParams.get(
          "limit"
        ) || "5"
      ),
      1
    );

    // ----------------------------------------------
    // SINGLE
    // ----------------------------------------------

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

            details: data,
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

    // ----------------------------------------------
    // ALL
    // ----------------------------------------------

    const response =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje?sort=-created&include=field_image,uid`,
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
        "Drupal GET obavestenja error:",
        response.status,
        data
      );

      return NextResponse.json(
        {
          error:
            "Greška pri učitavanju obaveštenja",

          details: data,
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
      Array.isArray(
        data?.included
      )
        ? data.included
        : [];

    const total =
      allData.length;

    const totalPages =
      Math.ceil(
        total / limit
      );

    const offset =
      (page - 1) *
      limit;

    const currentPageData =
      allData.slice(
        offset,
        offset + limit
      );

    const obavestenja:
      Obavestenje[] =
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

            if (
              fileUriValue
            ) {
              const filePath =
                fileUriValue.replace(
                  "public://",
                  "/sites/default/files/"
                );

              imageUrl =
                `${DRUPAL_BASE_URL}${filePath}`;
            }
          }

          const authorRel =
            item.relationships
              ?.uid?.data;

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
                authorObj
                  .attributes
                  .name;
            }
          }

          return {
            id: item.id,

            title:
              item.attributes
                ?.title ?? "",

            body:
              item.attributes
                ?.body
                ?.value ?? "",

            created:
              item.attributes
                ?.created ?? "",

            author:
              authorName,

            image:
              imageUrl,
          };
        }
      );

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
      { status: 500 }
    );
  }
}

// ==================================================
// POST
// ==================================================

export async function POST(
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
        { status: 401 }
      );
    }

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

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Naslov obaveštenja je obavezan",
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Tekst obaveštenja je obavezan",
        },
        { status: 400 }
      );
    }

    const drupalAuth =
      await loginToDrupal();

    if (!drupalAuth) {
      return NextResponse.json(
        {
          error:
            "Drupal login neuspešan",
        },
        { status: 401 }
      );
    }

    const {
      drupalCookie,
      csrfToken,
    } = drupalAuth;

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
        { status: 400 }
      );
    }

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

          details: data,
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json(
      data,
      { status: 201 }
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
      { status: 500 }
    );
  }
}

// ==================================================
// PATCH
// ==================================================

export async function PATCH(
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
        { status: 401 }
      );
    }

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

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID obaveštenja je obavezan",
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Naslov obaveštenja je obavezan",
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Tekst obaveštenja je obavezan",
        },
        { status: 400 }
      );
    }

    const drupalAuth =
      await loginToDrupal();

    if (!drupalAuth) {
      return NextResponse.json(
        {
          error:
            "Drupal login neuspešan",
        },
        { status: 401 }
      );
    }

    const {
      drupalCookie,
      csrfToken,
    } = drupalAuth;

    // ----------------------------------------------
    // CURRENT USER UUID
    // ----------------------------------------------

    const currentUserUuid =
      await getDrupalUserUuid(
        authUser.uid,
        drupalCookie
      );

    if (!currentUserUuid) {
      return NextResponse.json(
        {
          error:
            "Nije moguće pronaći trenutno ulogovanog korisnika u Drupalu",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // CHECK OWNER
    // ----------------------------------------------

    const ownership =
      await getObavestenjeAuthorUuid(
        id,
        drupalCookie
      );

    if (ownership.error) {
      return NextResponse.json(
        {
          error:
            "Greška pri proveri vlasništva obaveštenja",
        },
        { status: 500 }
      );
    }

    if (!ownership.exists) {
      return NextResponse.json(
        {
          error:
            "Obaveštenje nije pronađeno",
        },
        { status: 404 }
      );
    }

    if (
      !ownership.authorUuid ||
      ownership.authorUuid !==
        currentUserUuid
    ) {
      return NextResponse.json(
        {
          error:
            "Nemate dozvolu za izmenu ovog obaveštenja",
        },
        { status: 403 }
      );
    }

    // ----------------------------------------------
    // UPDATE
    // ----------------------------------------------

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

          details: data,
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
      { status: 500 }
    );
  }
}

// ==================================================
// DELETE
// ==================================================

export async function DELETE(
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
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID obaveštenja je obavezan",
        },
        { status: 400 }
      );
    }

    const drupalAuth =
      await loginToDrupal();

    if (!drupalAuth) {
      return NextResponse.json(
        {
          error:
            "Drupal login neuspešan",
        },
        { status: 401 }
      );
    }

    const {
      drupalCookie,
      csrfToken,
    } = drupalAuth;

    // ----------------------------------------------
    // CURRENT USER UUID
    // ----------------------------------------------

    const currentUserUuid =
      await getDrupalUserUuid(
        authUser.uid,
        drupalCookie
      );

    if (!currentUserUuid) {
      return NextResponse.json(
        {
          error:
            "Nije moguće pronaći trenutno ulogovanog korisnika u Drupalu",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // CHECK OWNER
    // ----------------------------------------------

    const ownership =
      await getObavestenjeAuthorUuid(
        id,
        drupalCookie
      );

    if (ownership.error) {
      return NextResponse.json(
        {
          error:
            "Greška pri proveri vlasništva obaveštenja",
        },
        { status: 500 }
      );
    }

    if (!ownership.exists) {
      return NextResponse.json(
        {
          error:
            "Obaveštenje nije pronađeno",
        },
        { status: 404 }
      );
    }

    if (
      !ownership.authorUuid ||
      ownership.authorUuid !==
        currentUserUuid
    ) {
      return NextResponse.json(
        {
          error:
            "Nemate dozvolu za brisanje ovog obaveštenja",
        },
        { status: 403 }
      );
    }

    // ----------------------------------------------
    // DELETE
    // ----------------------------------------------

    const response =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",

          headers: {
            Accept:
              "application/vnd.api+json",

            Cookie:
              drupalCookie,

            "X-CSRF-Token":
              csrfToken,
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
        "Drupal DELETE obavestenje error:",
        response.status,
        data
      );

      return NextResponse.json(
        {
          error:
            "Greška pri brisanju obaveštenja",

          details: data,
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Obaveštenje je uspešno obrisano",
    });
  } catch (error) {
    console.error(
      "Obavestenja DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Interna greška servera",
      },
      { status: 500 }
    );
  }
}

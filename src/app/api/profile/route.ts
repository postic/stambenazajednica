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
// IDENTIČAN PRINCIP KAO /api/glas
// ==================================================

async function loginToDrupal() {
  try {
    // --------------------------------------------------
    // 1. Drupal login
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

    const loginData =
      await loginResponse.json();

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
    // 2. Drupal session cookie
    // --------------------------------------------------

    let drupalCookie = "";

    /*
     * Node podržava getSetCookie().
     */

    if (
      typeof loginResponse.headers.getSetCookie ===
      "function"
    ) {
      const cookies =
        loginResponse.headers.getSetCookie();

      console.log(
        "Drupal Set-Cookie count:",
        cookies.length
      );

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

    /*
     * Fallback.
     */

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

    console.log(
      "Drupal CSRF token:",
      csrfToken
    );

    // --------------------------------------------------
    // 4. Auth rezultat
    // --------------------------------------------------

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
// GET
// ==================================================

export async function GET(
  req: NextRequest
) {
  try {
    // --------------------------------------------------
    // 1. next_auth
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

    const uid =
      String(authUser.uid);

    console.log(
      "Profile GET - UID:",
      uid
    );

    // --------------------------------------------------
    // 2. Drupal User
    // --------------------------------------------------

    const userResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/user/user?filter[uid]=${encodeURIComponent(
          uid
        )}`,
        {
          headers: {
            Accept:
              "application/vnd.api+json",
          },

          cache: "no-store",
        }
      );

    if (!userResponse.ok) {
      const errorText =
        await userResponse.text();

      console.error(
        "Drupal user error:",
        userResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Greška pri pronalaženju korisnika",
        },
        {
          status: 502,
        }
      );
    }

    const userJson =
      await userResponse.json();

    const userItem =
      userJson?.data?.[0];

    if (!userItem) {
      return NextResponse.json(
        {
          error:
            "Drupal korisnik nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    const userUuid =
      userItem.id;

    // --------------------------------------------------
    // 3. Pronađi Prostor
    // --------------------------------------------------

    const prostorResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/prostor?include=field_prostor_tip,field_prostor_sprat`,
        {
          headers: {
            Accept:
              "application/vnd.api+json",
          },

          cache: "no-store",
        }
      );

    if (!prostorResponse.ok) {
      const errorText =
        await prostorResponse.text();

      console.error(
        "Drupal prostor error:",
        prostorResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Greška pri pronalaženju prostora",
        },
        {
          status: 502,
        }
      );
    }

    const prostorJson =
      await prostorResponse.json();

    const data =
      prostorJson?.data || [];

    const included =
      prostorJson?.included || [];

    // --------------------------------------------------
    // 4. Pronađi prostor preko field_prostor_user
    // --------------------------------------------------

    const prostorItem =
      data.find((item: any) => {
        const relationship =
          item.relationships
            ?.field_prostor_user
            ?.data;

        if (!relationship) {
          return false;
        }

        if (
          !Array.isArray(
            relationship
          )
        ) {
          return (
            relationship.id ===
            userUuid
          );
        }

        return relationship.some(
          (ref: any) =>
            ref.id ===
            userUuid
        );
      });

    if (!prostorItem) {
      return NextResponse.json({
        user: {
          uid,

          name:
            userItem.attributes?.name ??
            authUser.name ??
            "",
        },

        prostor: null,
      });
    }

    // --------------------------------------------------
    // 5. Tip prostora
    // --------------------------------------------------

    const tipRel =
      prostorItem.relationships
        ?.field_prostor_tip
        ?.data;

    const tipIncluded =
      tipRel
        ? included.find(
            (item: any) =>
              item.type ===
                tipRel.type &&
              item.id ===
                tipRel.id
          )
        : null;

    // --------------------------------------------------
    // 6. Sprat
    // --------------------------------------------------

    const spratRel =
      prostorItem.relationships
        ?.field_prostor_sprat
        ?.data;

    const spratIncluded =
      spratRel
        ? included.find(
            (item: any) =>
              item.type ===
                spratRel.type &&
              item.id ===
                spratRel.id
          )
        : null;

    // --------------------------------------------------
    // 7. Rezultat
    // --------------------------------------------------

    return NextResponse.json({
      user: {
        uid,

        name:
          userItem.attributes?.name ??
          authUser.name ??
          "",
      },

      prostor: {
        id:
          prostorItem.id,

        title:
          prostorItem.attributes?.title ??
          "",

        tip:
          tipIncluded?.attributes?.name ??
          null,

        sprat:
          spratIncluded?.attributes?.name ??
          null,

        redniBroj:
          prostorItem.attributes
            ?.field_prostor_sprat_redni_broj ??
          null,

        broj_prostora:
          prostorItem.attributes
            ?.field_prostor_broj ??
          null,

        kvadratura:
          prostorItem.attributes
            ?.field_prostor_kvadratura ??
          null,

        broj_stanara:
          prostorItem.attributes
            ?.field_prostor_broj_stanara ??
          null,

        vlasnik:
          prostorItem.attributes
            ?.field_prostor_vlasnik ??
          null,

        korisnik:
          prostorItem.attributes
            ?.field_prostor_korisnik ??
          null,

        telefon:
          prostorItem.attributes
            ?.field_prostor_telefon ??
          null,

        email:
          prostorItem.attributes
            ?.field_prostor_email ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "Profile GET error:",
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
// ==================================================

export async function PATCH(
  req: NextRequest
) {
  try {
    // --------------------------------------------------
    // 1. next_auth
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

    const uid =
      String(authUser.uid);

    console.log(
      "Profile PATCH - UID:",
      uid
    );

    // --------------------------------------------------
    // 2. Body
    // --------------------------------------------------

    const body =
      await req.json();

    const field =
      body?.field;

    const value =
      typeof body?.value ===
      "string"
        ? body.value.trim()
        : "";

    // --------------------------------------------------
    // 3. Dozvoljeni fieldovi
    // --------------------------------------------------

    if (
      field !== "mail" &&
      field !== "phone"
    ) {
      return NextResponse.json(
        {
          error:
            "Nepoznat profil field",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 4. Pronađi Drupal User
    // --------------------------------------------------

    const userResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/user/user?filter[uid]=${encodeURIComponent(
          uid
        )}`,
        {
          headers: {
            Accept:
              "application/vnd.api+json",
          },

          cache: "no-store",
        }
      );

    if (!userResponse.ok) {
      const errorText =
        await userResponse.text();

      console.error(
        "Drupal user error:",
        userResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Greška pri pronalaženju korisnika",
        },
        {
          status: 502,
        }
      );
    }

    const userJson =
      await userResponse.json();

    const userItem =
      userJson?.data?.[0];

    if (!userItem) {
      return NextResponse.json(
        {
          error:
            "Drupal korisnik nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    const userUuid =
      userItem.id;

    // --------------------------------------------------
    // 5. Pronađi Prostor
    // --------------------------------------------------

    const prostorResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/prostor`,
        {
          headers: {
            Accept:
              "application/vnd.api+json",
          },

          cache: "no-store",
        }
      );

    if (!prostorResponse.ok) {
      const errorText =
        await prostorResponse.text();

      console.error(
        "Drupal prostor error:",
        prostorResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Greška pri pronalaženju prostora",
        },
        {
          status: 502,
        }
      );
    }

    const prostorJson =
      await prostorResponse.json();

    const prostorData =
      prostorJson?.data || [];

    // --------------------------------------------------
    // 6. Prostor pripada korisniku
    // --------------------------------------------------

    const prostorItem =
      prostorData.find(
        (item: any) => {
          const relationship =
            item.relationships
              ?.field_prostor_user
              ?.data;

          if (!relationship) {
            return false;
          }

          if (
            !Array.isArray(
              relationship
            )
          ) {
            return (
              relationship.id ===
              userUuid
            );
          }

          return relationship.some(
            (ref: any) =>
              ref.id ===
              userUuid
          );
        }
      );

    if (!prostorItem) {
      return NextResponse.json(
        {
          error:
            "Prostor nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "Profile PATCH - Prostor:",
      prostorItem.id
    );

    // --------------------------------------------------
    // 7. Drupal field
    // --------------------------------------------------

    const drupalField =
      field === "mail"
        ? "field_prostor_email"
        : "field_prostor_telefon";

    console.log(
      "Profile PATCH - Field:",
      drupalField
    );

    // --------------------------------------------------
    // 8. Drupal login
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

    console.log(
      "Drupal authentication uspešna"
    );

    // --------------------------------------------------
    // 9. PATCH
    // --------------------------------------------------

    const patchResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/prostor/${prostorItem.id}`,
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
                "node--prostor",

              id:
                prostorItem.id,

              attributes: {
                [drupalField]:
                  value || null,
              },
            },
          }),

          cache: "no-store",
        }
      );

    const patchText =
      await patchResponse.text();

    let patchData: any;

    try {
      patchData =
        JSON.parse(
          patchText
        );
    } catch {
      patchData =
        patchText;
    }

    // --------------------------------------------------
    // 10. Greška
    // --------------------------------------------------

    if (!patchResponse.ok) {
      console.error(
        "Drupal PATCH error:",
        patchResponse.status,
        JSON.stringify(
          patchData,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            "Greška pri čuvanju podataka",

          details:
            patchData,
        },
        {
          status:
            patchResponse.status,
        }
      );
    }

    // --------------------------------------------------
    // 11. Uspešno
    // --------------------------------------------------

    console.log(
      "Profile PATCH uspešan",
      {
        uid,
        prostor:
          prostorItem.id,
        field,
      }
    );

    return NextResponse.json({
      success: true,

      user: {
        uid,

        name:
          userItem.attributes?.name ??
          authUser.name ??
          "",
      },

      prostor: {
        id:
          prostorItem.id,

        [field === "mail"
          ? "email"
          : "telefon"]:
          value || null,
      },
    });
  } catch (error) {
    console.error(
      "Profile PATCH error:",
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

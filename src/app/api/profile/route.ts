import { NextRequest } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// --------------------------------------------------
// next_auth
// --------------------------------------------------

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

// --------------------------------------------------
// Drupal cookies
// --------------------------------------------------

function getDrupalCookieHeader(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
    return "";
  }

  return cookieHeader;
}

// --------------------------------------------------
// Drupal CSRF token
// --------------------------------------------------

async function getCsrfToken(req: NextRequest) {
  try {
    const cookie = getDrupalCookieHeader(req);

    const response = await fetch(
      `${DRUPAL_BASE_URL}/session/token`,
      {
        headers: {
          Accept: "text/plain",
          ...(cookie
            ? {
                Cookie: cookie,
              }
            : {}),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "CSRF token error:",
        response.status,
        await response.text()
      );

      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(
      "CSRF token exception:",
      error
    );

    return null;
  }
}

// ==================================================
// GET
// ==================================================

export async function GET(req: NextRequest) {
  try {
    // --------------------------------------------------
    // 1. next_auth
    // --------------------------------------------------

    const authUser =
      getNextAuthUser(req);

    if (!authUser?.uid) {
      return Response.json(
        {
          error: "Korisnik nije prijavljen",
        },
        {
          status: 401,
        }
      );
    }

    const uid = String(authUser.uid);

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
      console.error(
        "Drupal user error:",
        userResponse.status,
        await userResponse.text()
      );

      return Response.json(
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
      return Response.json(
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
    // 3. Pronađi Prostor preko field_prostor_user
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
      console.error(
        "Drupal prostor error:",
        prostorResponse.status,
        await prostorResponse.text()
      );

      return Response.json(
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
    // 4. Pronađi prostor koji ima
    //    field_prostor_user = naš Drupal User
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

        // Entity reference može biti pojedinačni objekat
        if (!Array.isArray(relationship)) {
          return (
            relationship.id ===
            userUuid
          );
        }

        // Ili lista
        return relationship.some(
          (ref: any) =>
            ref.id === userUuid
        );
      });

    if (!prostorItem) {
      return Response.json({
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
              item.id === tipRel.id
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
              item.id === spratRel.id
          )
        : null;

    // --------------------------------------------------
    // 7. Rezultat
    // --------------------------------------------------

    return Response.json({
      user: {
        uid,

        name:
          userItem.attributes?.name ??
          authUser.name ??
          "",
      },

      prostor: {
        id: prostorItem.id,

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

    return Response.json(
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
    // 1. Provera next_auth
    // --------------------------------------------------

    const authUser =
      getNextAuthUser(req);

    if (!authUser?.uid) {
      return Response.json(
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
    // 2. Body
    // --------------------------------------------------

    const body =
      await req.json();

    const field =
      body?.field;

    const value =
      typeof body?.value === "string"
        ? body.value.trim()
        : "";

    if (
      field !== "mail" &&
      field !== "phone"
    ) {
      return Response.json(
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
    // 3. Pronađi User
    // --------------------------------------------------

    const uid =
      String(authUser.uid);

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
      return Response.json(
        {
          error:
            "Drupal korisnik nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    const userJson =
      await userResponse.json();

    const userItem =
      userJson?.data?.[0];

    if (!userItem) {
      return Response.json(
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
    // 4. Pronađi Prostor
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
      return Response.json(
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

    const prostorItem =
      (prostorJson?.data || []).find(
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
              ref.id === userUuid
          );
        }
      );

    if (!prostorItem) {
      return Response.json(
        {
          error:
            "Prostor nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 5. Odredi Drupal field
    // --------------------------------------------------

    const drupalField =
      field === "mail"
        ? "field_prostor_email"
        : "field_prostor_telefon";

    // --------------------------------------------------
    // 6. CSRF token
    // --------------------------------------------------

    const csrfToken =
      await getCsrfToken(req);

    if (!csrfToken) {
      return Response.json(
        {
          error:
            "Nije moguće dobiti Drupal CSRF token",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------
    // 7. Drupal cookies
    // --------------------------------------------------

    const cookie =
      getDrupalCookieHeader(req);

    // --------------------------------------------------
    // 8. PATCH Prostor node
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

            "X-CSRF-Token":
              csrfToken,

            ...(cookie
              ? {
                  Cookie: cookie,
                }
              : {}),
          },

          body: JSON.stringify({
            data: {
              type: "node--prostor",

              id: prostorItem.id,

              attributes: {
                [drupalField]:
                  value || null,
              },
            },
          }),
        }
      );

    if (!patchResponse.ok) {
      const errorText =
        await patchResponse.text();

      console.error(
        "Drupal PATCH error:",
        patchResponse.status,
        errorText
      );

      return Response.json(
        {
          error:
            "Greška pri čuvanju podataka",
          details: errorText,
        },
        {
          status: 502,
        }
      );
    }

    const updated =
      await patchResponse.json();

    // --------------------------------------------------
    // 9. Vraćamo novi podatak
    // --------------------------------------------------

    return Response.json({
      user: {
        uid,
        name:
          userItem.attributes?.name ??
          authUser.name ??
          "",
      },

      prostor: {
        id: prostorItem.id,

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

    return Response.json(
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

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// GET
// ==================================================

export async function GET() {
  try {
    // ----------------------------------------------
    // 1. Učitaj obaveštenja
    // ----------------------------------------------

    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje?include=field_tip_obavestenja&sort=-created&page[limit]=100`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();

      return NextResponse.json(
        {
          error: "Greška pri učitavanju obaveštenja",
          details: text,
        },
        {
          status: response.status,
        }
      );
    }

    const json = await response.json();

    const items = Array.isArray(json?.data)
      ? json.data
      : [];

    // ----------------------------------------------
    // 2. Učitaj sve kategorije
    // ----------------------------------------------

    const categoriesResponse = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/tip_obavestenja?sort=weight`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!categoriesResponse.ok) {
      const text = await categoriesResponse.text();

      return NextResponse.json(
        {
          error: "Greška pri učitavanju kategorija",
          details: text,
        },
        {
          status: categoriesResponse.status,
        }
      );
    }

    const categoriesJson =
      await categoriesResponse.json();

    const terms = Array.isArray(categoriesJson?.data)
      ? categoriesJson.data
      : [];

    // ----------------------------------------------
    // 3. Prebroj obaveštenja po kategoriji
    // ----------------------------------------------

    const counts = new Map<string, number>();

    for (const item of items) {
      const relationship =
        item?.relationships?.field_tip_obavestenja?.data;

      if (!relationship) {
        continue;
      }

      const relations = Array.isArray(relationship)
        ? relationship
        : [relationship];

      for (const relation of relations) {
        if (!relation?.id) {
          continue;
        }

        counts.set(
          relation.id,
          (counts.get(relation.id) || 0) + 1
        );
      }
    }

    // ----------------------------------------------
    // 4. Napravi kategorije
    // ----------------------------------------------

    const categories = terms.map((term: any) => {
      const id = term.id;

      const name =
        term.attributes?.name || "";

      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return {
        id,
        name,
        slug,
        brojObavestenja:
          counts.get(id) || 0,
      };
    });

    console.log(
      "KATEGORIJE:",
      categories
    );

    // ----------------------------------------------
    // 5. Response
    // ----------------------------------------------

    return NextResponse.json({
      data: items,
      categories,
    });
  } catch (error) {
    console.error(
      "Greška pri GET /api/obavestenja:",
      error
    );

    return NextResponse.json(
      {
        error: "Greška na serveru",
      },
      {
        status: 500,
      }
    );
  }
}

// ==================================================
// POST
// ==================================================

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title =
      formData.get("title")?.toString().trim() || "";

    const description =
      formData.get("description")?.toString().trim() || "";

    const kategorija =
      formData.get("kategorija")?.toString().trim() || "";

    const imageValue = formData.get("image");

    const image =
      imageValue instanceof File && imageValue.size > 0
        ? imageValue
        : null;

    // ----------------------------------------------
    // Validacija
    // ----------------------------------------------

    if (!title) {
      return NextResponse.json(
        {
          error: "Naslov je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          error: "Opis je obavezan",
        },
        {
          status: 400,
        }
      );
    }

    if (!kategorija) {
      return NextResponse.json(
        {
          error: "Kategorija je obavezna",
        },
        {
          status: 400,
        }
      );
    }

    if (image && !image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Dozvoljeno je dodavanje samo slike.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // Drupal cookies
    // ----------------------------------------------

    const cookieStore = await cookies();

    const drupalCookies = cookieStore
      .getAll()
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

    if (!drupalCookies) {
      return NextResponse.json(
        {
          error:
            "Drupal sesija nije pronađena. Potrebno je biti prijavljen.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // CSRF token
    // ----------------------------------------------

    const csrfResponse = await fetch(
      `${DRUPAL_BASE_URL}/session/token`,
      {
        headers: {
          Cookie: drupalCookies,
        },
        cache: "no-store",
      }
    );

    if (!csrfResponse.ok) {
      const text = await csrfResponse.text();

      return NextResponse.json(
        {
          error:
            "Nije moguće dobiti Drupal CSRF token",
          details: text,
        },
        {
          status: csrfResponse.status,
        }
      );
    }

    const csrfToken =
      await csrfResponse.text();

    // ==================================================
    // 1. KREIRANJE OBAVEŠTENJA
    // ==================================================

    const createResponse = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje`,
      {
        method: "POST",

        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type":
            "application/vnd.api+json",
          Cookie: drupalCookies,
          "X-CSRF-Token": csrfToken,
        },

        body: JSON.stringify({
          data: {
            type: "node--obavestenje",

            attributes: {
              title,

              body: {
                value: description,
                format: "plain_text",
              },
            },

            relationships: {
              field_tip_obavestenja: {
                data: {
                  type:
                    "taxonomy_term--tip_obavestenja",
                  id: kategorija,
                },
              },
            },
          },
        }),
      }
    );

    const createText =
      await createResponse.text();

    let createData: any = null;

    try {
      createData = createText
        ? JSON.parse(createText)
        : null;
    } catch {
      createData = null;
    }

    if (!createResponse.ok) {
      console.error(
        "Drupal greška pri kreiranju obaveštenja:",
        createText
      );

      return NextResponse.json(
        {
          error:
            createData?.errors?.[0]?.detail ||
            createData?.message ||
            "Greška pri kreiranju obaveštenja",

          details:
            createData ?? createText,
        },
        {
          status: createResponse.status,
        }
      );
    }

    const nodeData = createData?.data;

    if (!nodeData?.id) {
      return NextResponse.json(
        {
          error:
            "Obaveštenje je kreirano, ali Drupal nije vratio UUID.",
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // 2. UPLOAD SLIKE
    // ==================================================

    if (image) {
      const imageBuffer = Buffer.from(
        await image.arrayBuffer()
      );

      const uploadResponse = await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${nodeData.id}/field_image`,
        {
          method: "POST",

          headers: {
            Accept: "application/vnd.api+json",

            "Content-Type":
              "application/octet-stream",

            "Content-Disposition":
              `file; filename="${image.name}"`,

            Cookie: drupalCookies,

            "X-CSRF-Token":
              csrfToken,
          },

          body: imageBuffer,
        }
      );

      const uploadText =
        await uploadResponse.text();

      let uploadData: any = null;

      try {
        uploadData = uploadText
          ? JSON.parse(uploadText)
          : null;
      } catch {
        uploadData = null;
      }

      if (!uploadResponse.ok) {
        console.error(
          "Drupal greška pri uploadu slike:",
          uploadText
        );

        return NextResponse.json(
          {
            error:
              uploadData?.errors?.[0]?.detail ||
              uploadData?.message ||
              "Obaveštenje je kreirano, ali upload slike nije uspeo.",

            details:
              uploadData ?? uploadText,
          },
          {
            status: uploadResponse.status,
          }
        );
      }

      console.log(
        "Slika uspešno uploadovana:",
        uploadData?.data?.id
      );
    }

    // ==================================================
    // USPEH
    // ==================================================

    return NextResponse.json({
      data: nodeData,
      imageUploaded: !!image,
    });
  } catch (error) {
    console.error(
      "Greška pri POST /api/obavestenja:",
      error
    );

    return NextResponse.json(
      {
        error: "Greška na serveru",
      },
      {
        status: 500,
      }
    );
  }
}

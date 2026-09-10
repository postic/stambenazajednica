import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// Drupal autentikacija
// ==================================================

async function getDrupalAuth() {
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
    throw new Error(
      "Drupal sesija nije pronađena. Potrebno je biti prijavljen."
    );
  }

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

    throw new Error(
      `Nije moguće dobiti Drupal CSRF token: ${text}`
    );
  }

  const csrfToken =
    await csrfResponse.text();

  return {
    drupalCookies,
    csrfToken,
  };
}

// ==================================================
// GET
// ==================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      slug: string;
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID obaveštenja je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}?include=field_image,field_tip_obavestenja`,
      {
        headers: {
          Accept:
            "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    const text =
      await response.text();

    let data: any = null;

    try {
      data = text
        ? JSON.parse(text)
        : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.errors?.[0]?.detail ||
            data?.message ||
            "Greška pri učitavanju obaveštenja.",

          details:
            data ?? text,
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(
      "Greška pri GET obaveštenja:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Greška na serveru.",
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
  request: Request,
  context: {
    params: Promise<{
      slug: string;
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID obaveštenja je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 1. FormData
    // ==================================================

    const formData =
      await request.formData();

    const title =
      formData
        .get("title")
        ?.toString()
        .trim() || "";

    const description =
      formData
        .get("description")
        ?.toString()
        .trim() || "";

    const kategorija =
      formData
        .get("kategorija")
        ?.toString()
        .trim() || "";

    const imageValue =
      formData.get("image");

    const image =
      imageValue instanceof File &&
      imageValue.size > 0
        ? imageValue
        : null;

    // ==================================================
    // 2. Slike koje treba obrisati
    // ==================================================

    const removeImageIds =
      formData
        .getAll("removeImageIds")
        .map((value) =>
          value.toString().trim()
        )
        .filter(Boolean);

    // ==================================================
    // 3. Validacija
    // ==================================================

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Naslov je obavezan.",
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
            "Opis je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    if (!kategorija) {
      return NextResponse.json(
        {
          error:
            "Kategorija je obavezna.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      image &&
      !image.type.startsWith("image/")
    ) {
      return NextResponse.json(
        {
          error:
            "Dozvoljeno je dodavanje samo slike.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. Drupal auth
    // ==================================================

    let drupalCookies: string;
    let csrfToken: string;

    try {
      const auth =
        await getDrupalAuth();

      drupalCookies =
        auth.drupalCookies;

      csrfToken =
        auth.csrfToken;
    } catch (error: any) {
      return NextResponse.json(
        {
          error:
            error?.message ||
            "Drupal sesija nije pronađena.",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // 5. Ako brišemo slike, učitaj postojeći node
    // ==================================================

    let remainingImages:
      | {
          type: string;
          id: string;
        }[]
      | null = null;

    if (
      removeImageIds.length > 0
    ) {
      const currentResponse =
        await fetch(
          `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}`,
          {
            headers: {
              Accept:
                "application/vnd.api+json",

              Cookie:
                drupalCookies,
            },

            cache: "no-store",
          }
        );

      const currentText =
        await currentResponse.text();

      let currentData: any = null;

      try {
        currentData =
          currentText
            ? JSON.parse(
                currentText
              )
            : null;
      } catch {
        currentData = null;
      }

      if (!currentResponse.ok) {
        return NextResponse.json(
          {
            error:
              "Nije moguće učitati postojeće fotografije.",

            details:
              currentData ??
              currentText,
          },
          {
            status:
              currentResponse.status,
          }
        );
      }

      const currentImageRelations =
        currentData?.data
          ?.relationships
          ?.field_image
          ?.data;

      const imageRelations =
        Array.isArray(
          currentImageRelations
        )
          ? currentImageRelations
          : currentImageRelations
            ? [
                currentImageRelations,
              ]
            : [];

      remainingImages =
        imageRelations.filter(
          (imageItem: any) =>
            imageItem?.id &&
            !removeImageIds.includes(
              imageItem.id
            )
        );
    }

    // ==================================================
    // 6. PATCH NODE
    //
    // Ovde menjamo:
    // - naslov
    // - tekst
    // - kategoriju
    // - postojeće slike ako ih brišemo
    // ==================================================

    const nodeData: any = {
      type:
        "node--obavestenje",

      id,

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
    };

    // Ako su označene slike za brisanje,
    // pošalji preostale slike u field_image.
    //
    // Ako nema slika koje se brišu,
    // field_image se uopšte ne dira.

    if (
      remainingImages !== null
    ) {
      nodeData.relationships.field_image =
        {
          data: remainingImages,
        };
    }

    const updateResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}`,
        {
          method: "PATCH",

          headers: {
            Accept:
              "application/vnd.api+json",

            "Content-Type":
              "application/vnd.api+json",

            Cookie:
              drupalCookies,

            "X-CSRF-Token":
              csrfToken,
          },

          body: JSON.stringify({
            data: nodeData,
          }),
        }
      );

    const updateText =
      await updateResponse.text();

    let updateData: any = null;

    try {
      updateData =
        updateText
          ? JSON.parse(
              updateText
            )
          : null;
    } catch {
      updateData = null;
    }

    if (!updateResponse.ok) {
      console.error(
        "Drupal greška pri izmeni obaveštenja:",
        updateText
      );

      return NextResponse.json(
        {
          error:
            updateData
              ?.errors?.[0]
              ?.detail ||
            updateData?.message ||
            "Greška pri izmeni obaveštenja.",

          details:
            updateData ??
            updateText,
        },
        {
          status:
            updateResponse.status,
        }
      );
    }

    // ==================================================
    // 7. Upload nove slike
    // ==================================================

    let imageUploaded = false;

    if (image) {
      const imageBuffer =
        Buffer.from(
          await image.arrayBuffer()
        );

      const uploadResponse =
        await fetch(
          `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}/field_image`,
          {
            method: "POST",

            headers: {
              Accept:
                "application/vnd.api+json",

              "Content-Type":
                "application/octet-stream",

              "Content-Disposition":
                `file; filename="${image.name}"`,

              Cookie:
                drupalCookies,

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
        uploadData =
          uploadText
            ? JSON.parse(
                uploadText
              )
            : null;
      } catch {
        uploadData = null;
      }

      if (!uploadResponse.ok) {
        console.error(
          "Drupal greška pri uploadu nove slike:",
          uploadText
        );

        return NextResponse.json(
          {
            error:
              uploadData
                ?.errors?.[0]
                ?.detail ||
              uploadData?.message ||
              "Obaveštenje je izmenjeno, ali upload nove slike nije uspeo.",

            details:
              uploadData ??
              uploadText,
          },
          {
            status:
              uploadResponse.status,
          }
        );
      }

      imageUploaded = true;

      console.log(
        "Nova slika uspešno uploadovana:",
        uploadData?.data?.id
      );
    }

    // ==================================================
    // 8. Uspeh
    // ==================================================

    return NextResponse.json({
      success: true,

      data:
        updateData?.data ??
        null,

      imagesRemoved:
        removeImageIds.length,

      imageUploaded,
    });
  } catch (error: any) {
    console.error(
      "Greška pri PATCH obaveštenja:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Greška na serveru.",
      },
      {
        status: 500,
      }
    );
  }
}

// ==================================================
// DELETE
// ==================================================

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      slug: string;
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID obaveštenja je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    let drupalCookies: string;
    let csrfToken: string;

    try {
      const auth =
        await getDrupalAuth();

      drupalCookies =
        auth.drupalCookies;

      csrfToken =
        auth.csrfToken;
    } catch (error: any) {
      return NextResponse.json(
        {
          error:
            error?.message ||
            "Drupal sesija nije pronađena.",
        },
        {
          status: 401,
        }
      );
    }

    const deleteResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}`,
        {
          method: "DELETE",

          headers: {
            Accept:
              "application/vnd.api+json",

            Cookie:
              drupalCookies,

            "X-CSRF-Token":
              csrfToken,
          },
        }
      );

    const deleteText =
      await deleteResponse.text();

    if (!deleteResponse.ok) {
      let deleteData: any = null;

      try {
        deleteData =
          deleteText
            ? JSON.parse(
                deleteText
              )
            : null;
      } catch {
        deleteData = null;
      }

      return NextResponse.json(
        {
          error:
            deleteData
              ?.errors?.[0]
              ?.detail ||
            deleteData?.message ||
            "Greška pri brisanju obaveštenja.",

          details:
            deleteData ??
            deleteText,
        },
        {
          status:
            deleteResponse.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      "Greška pri DELETE obaveštenja:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Greška na serveru.",
      },
      {
        status: 500,
      }
    );
  }
}

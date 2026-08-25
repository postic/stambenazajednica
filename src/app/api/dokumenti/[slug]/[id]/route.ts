import { NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
      id: string;
    }>;
  }
) {
  try {
    const { slug, id } =
      await context.params;

    const url =
      `${DRUPAL_BASE_URL}/jsonapi/node/dokument/${id}` +
      `?include=field_tip_dokumenta,field_dokument_file`;

    const response = await fetch(url, {
      headers: {
        Accept:
          "application/vnd.api+json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Dokument nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    const json = await response.json();

    const item = json.data;

    if (!item) {
      return NextResponse.json(
        {
          error:
            "Dokument nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    const included =
      json.included || [];

    // =====================================================
    // KATEGORIJA
    // =====================================================

    const categoryId =
      item.relationships
        ?.field_tip_dokumenta
        ?.data?.id || null;

    let category = null;

    if (categoryId) {
      const categoryItem =
        included.find(
          (i: any) =>
            i.type ===
              "taxonomy_term--tip_dokumenta" &&
            i.id === categoryId
        );

      if (categoryItem) {
        const name =
          categoryItem.attributes?.name ||
          "";

        category = {
          id: categoryItem.id,
          name,
          slug: createSlug(name),
        };
      }
    }

    // =====================================================
    // PROVERA KATEGORIJE
    // =====================================================

    if (
      category &&
      category.slug !== slug
    ) {
      return NextResponse.json(
        {
          error:
            "Dokument ne pripada ovoj kategoriji",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // FILE
    // =====================================================

    const files: {
      url: string;
      filename?: string;
      mime?: string;
      description?: string;
      size?: number;
    }[] = [];

    const fileRelation =
      item.relationships
        ?.field_dokument_file
        ?.data || [];

    /*
     * field_dokument_file može biti
     * single ili multiple.
     */
    const fileReferences =
      Array.isArray(fileRelation)
        ? fileRelation
        : fileRelation
          ? [fileRelation]
          : [];

    for (const fileReference of fileReferences) {
      const file = included.find(
        (i: any) =>
          i.id === fileReference.id
      );

      if (!file) {
        continue;
      }

      const fileUrl =
        file.attributes?.uri?.url;

      if (!fileUrl) {
        continue;
      }

      const url =
        fileUrl.startsWith("http")
          ? fileUrl
          : `${DRUPAL_BASE_URL}${fileUrl}`;

      files.push({
        url,
        filename:
          file.attributes?.filename,
        mime:
          file.attributes?.filemime,
        size:
          file.attributes?.filesize ?? 0,
        description:
          fileReference.meta
            ?.description ||
          file.attributes?.filename,
      });
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      id: item.id,

      title:
        item.attributes?.title ||
        "",

      body:
        item.attributes?.body?.value ||
        "",

      created:
        item.attributes?.created ||
        "",

      status:
        item.attributes
          ?.field_status_dokumenta ||
        "",

      category,

      files,
    });
  } catch (error) {
    console.error(
      "Server error fetching dokument:",
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

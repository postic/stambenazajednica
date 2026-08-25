import { NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// =========================================================
// SLUG
// =========================================================

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// =========================================================
// TYPES
// =========================================================

type FileItem = {
  url: string;
  filename?: string;
  mime?: string;
  description?: string;
  size?: number;
};

type DokumentResponse = {
  id: string;
  title: string;
  body: string;
  created: string;
  status: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  files: FileItem[];
};

// =========================================================
// GET
// =========================================================

export async function GET(
  _req: Request,
  context: {
    params: Promise<{
      slug: string;
      id: string;
    }>;
  }
) {
  try {
    const { slug, id } = await context.params;

    console.log("=================================");
    console.log("DOKUMENT DETAIL");
    console.log("slug:", slug);
    console.log("id:", id);

    // =====================================================
    // PROVERA PARAMETARA
    // =====================================================

    if (!id) {
      return NextResponse.json(
        {
          error: "Nedostaje ID dokumenta",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // DRUPAL URL
    // =====================================================

    const url =
      `${DRUPAL_BASE_URL}/jsonapi/node/dokument/${encodeURIComponent(id)}` +
      `?include=field_tip_dokumenta,field_dokument_file`;

    console.log("Drupal URL:", url);

    // =====================================================
    // FETCH DRUPAL
    // =====================================================

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.api+json",
      },
      cache: "no-store",
    });

    console.log("Drupal status:", response.status);

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "Drupal dokument error:",
        response.status,
        text
      );

      return NextResponse.json(
        {
          error: "Dokument nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    const json = await response.json();

    const item = json.data;

    // =====================================================
    // PROVERA DOKUMENTA
    // =====================================================

    if (!item) {
      return NextResponse.json(
        {
          error: "Dokument nije pronađen",
        },
        {
          status: 404,
        }
      );
    }

    const included = json.included || [];

    // =====================================================
    // KATEGORIJA
    // =====================================================

    const categoryId =
      item.relationships
        ?.field_tip_dokumenta
        ?.data?.id || null;

    let category:
      DokumentResponse["category"] = null;

    if (categoryId) {
      const categoryItem = included.find(
        (includedItem: any) =>
          includedItem.type ===
            "taxonomy_term--tip_dokumenta" &&
          includedItem.id === categoryId
      );

      if (categoryItem) {
        const name =
          categoryItem.attributes?.name || "";

        category = {
          id: categoryItem.id,
          name,
          slug: createSlug(name),
        };
      }
    }

    // =====================================================
    // SLUG PROVERA
    // =====================================================

    /*
     * Slug ne određuje da li dokument postoji.
     * Dokument se pronalazi preko ID-a.
     *
     * Ako je kategorija pronađena, samo proveravamo
     * da li slug odgovara kategoriji.
     *
     * Ne vraćamo 404 zbog razlike u velikim/malim slovima.
     */

    if (
      category &&
      slug &&
      category.slug !== createSlug(slug)
    ) {
      console.warn(
        "Slug kategorije se razlikuje:",
        {
          urlSlug: slug,
          expectedSlug: category.slug,
        }
      );
    }

    // =====================================================
    // FILES
    // =====================================================

    const files: FileItem[] = [];

    const fileRelation =
      item.relationships
        ?.field_dokument_file
        ?.data || [];

    /*
     * field_dokument_file može biti:
     *
     * - jedan fajl
     * - više fajlova
     * - null
     */

    const fileReferences = Array.isArray(
      fileRelation
    )
      ? fileRelation
      : fileRelation
        ? [fileRelation]
        : [];

    // =====================================================
    // FILE LOOP
    // =====================================================

    for (const fileReference of fileReferences) {
      if (!fileReference?.id) {
        continue;
      }

      const file = included.find(
        (includedItem: any) =>
          includedItem.type === "file--file" &&
          includedItem.id === fileReference.id
      );

      if (!file) {
        console.warn(
          "Fajl nije pronađen u included:",
          fileReference.id
        );

        continue;
      }

      const fileUrl =
        file.attributes?.uri?.url;

      if (!fileUrl) {
        continue;
      }

      const absoluteUrl =
        fileUrl.startsWith("http")
          ? fileUrl
          : `${DRUPAL_BASE_URL}${fileUrl}`;

      files.push({
        url: absoluteUrl,

        filename:
          file.attributes?.filename ||
          undefined,

        mime:
          file.attributes?.filemime ||
          undefined,

        size:
          file.attributes?.filesize ?? 0,

        description:
          fileReference.meta
            ?.description ||
          file.attributes?.filename ||
          undefined,
      });
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    const dokument: DokumentResponse = {
      id: item.id,

      title:
        item.attributes?.title || "",

      body:
        item.attributes?.body?.value || "",

      created:
        item.attributes?.created || "",

      status:
        item.attributes
          ?.field_status_dokumenta || "",

      category,

      files,
    };

    console.log(
      "Dokument uspešno pronađen:",
      dokument.id,
      dokument.title
    );

    console.log("=================================");

    return NextResponse.json(dokument);
  } catch (error) {
    console.error(
      "Server error fetching dokument:",
      error
    );

    return NextResponse.json(
      {
        error: "Interna greška servera",
      },
      {
        status: 500,
      }
    );
  }
}

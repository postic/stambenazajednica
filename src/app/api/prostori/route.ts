import type { Prostor } from "@/types/prostor";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(
      parseInt(searchParams.get("page") || "1"),
      1
    );

    const limit = Math.max(
      parseInt(searchParams.get("limit") || "5"),
      1
    );

    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
      "http://localhost:8888";

    // --------------------------------------------------
    // Drupal JSON:API
    // --------------------------------------------------

    const response = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/prostor?include=field_prostor_sprat,field_prostor_tip`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();

      console.log(
        "Drupal API error:",
        response.status,
        text
      );

      return new Response(
        JSON.stringify({
          error: "Greška pri dohvaćanju prostora",
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const json = await response.json();

    const data = json.data || [];
    const included = json.included || [];

    // --------------------------------------------------
    // Pomoćna funkcija za pronalaženje taxonomy termina
    // --------------------------------------------------

    const findIncluded = (
      type: string,
      id: string | undefined
    ) => {
      if (!id) return null;

      return included.find(
        (item: any) =>
          item.type === type &&
          item.id === id
      );
    };

    // --------------------------------------------------
    // Mapiranje svih prostora
    // --------------------------------------------------

    const sviProstori = data.map((item: any) => {
      const tipId =
        item.relationships
          ?.field_prostor_tip
          ?.data
          ?.id;

      const spratId =
        item.relationships
          ?.field_prostor_sprat
          ?.data
          ?.id;

      const tipTerm = findIncluded(
        "taxonomy_term--tip_prostora",
        tipId
      );

      const spratTerm = findIncluded(
        "taxonomy_term--sprat",
        spratId
      );

      return {
        id: item.id,

        title:
          item.attributes?.title || "",

        body:
          item.attributes?.body?.value || "",

        created:
          item.attributes?.created || "",

        // ------------------------------
        // Sprat
        // ------------------------------

        sprat:
          spratTerm?.attributes?.name ?? null,

        // Weight Taxonomy termina
        spratWeight:
          Number(
            spratTerm?.attributes?.weight ?? 0
          ),

        // ------------------------------
        // Prostor
        // ------------------------------

        kvadratura:
          item.attributes
            ?.field_prostor_kvadratura ?? null,

        broj_stanara:
          item.attributes
            ?.field_prostor_broj_stanara ?? null,

        vlasnik:
          item.attributes
            ?.field_vlasnik ?? null,

        stanari:
          item.attributes
            ?.field_stanari ?? null,

        // ------------------------------
        // Tip prostora
        // ------------------------------

        tip:
          tipTerm?.attributes?.name ?? null,

        // ------------------------------
        // Broj prostora
        // ------------------------------

        broj_prostora:
          item.attributes
            ?.field_prostor_broj ?? null,

        // ------------------------------
        // Broj za sortiranje
        // ------------------------------

        sortBroj:
          Number(
            item.attributes
              ?.field_sort_broj ?? 999999
          ),
      };
    });

    // --------------------------------------------------
    // SORTIRANJE
    //
    // 1. Sprat
    // 2. Broj prostora
    // --------------------------------------------------

    sviProstori.sort((a: any, b: any) => {
      // Prvo sprat
      if (a.spratWeight !== b.spratWeight) {
        return a.spratWeight - b.spratWeight;
      }

      // Zatim broj prostora
      if (a.sortBroj !== b.sortBroj) {
        return a.sortBroj - b.sortBroj;
      }

      // Ako je sve isto, sortiraj po nazivu
      return a.title.localeCompare(
        b.title,
        "sr"
      );
    });

    // --------------------------------------------------
    // PAGINACIJA
    // --------------------------------------------------

    const total = sviProstori.length;

    const totalPages = Math.ceil(
      total / limit
    );

    const currentPageData =
      sviProstori.slice(
        offset,
        offset + limit
      );

    // --------------------------------------------------
    // Rezultat
    // --------------------------------------------------

    const prostori: Prostor[] =
      currentPageData;

    return new Response(
      JSON.stringify({
        data: prostori,
        total,
        page,
        totalPages,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log(
      "Server error fetching prostori:",
      error
    );

    return new Response(
      JSON.stringify({
        error: "Interna greška servera",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

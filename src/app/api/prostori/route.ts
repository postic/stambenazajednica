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
    // Pronađi taxonomy termin
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
    // Mapiranje prostora
    // --------------------------------------------------

    const sviProstori = data.map((item: any) => {
      // ------------------------------
      // Tip
      // ------------------------------

      const tipId =
        item.relationships
          ?.field_prostor_tip
          ?.data
          ?.id;

      const tipTerm = findIncluded(
        "taxonomy_term--tip_prostora",
        tipId
      );

      // ------------------------------
      // Sprat
      // ------------------------------

      const spratId =
        item.relationships
          ?.field_prostor_sprat
          ?.data
          ?.id;

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

        spratWeight:
          Number(
            spratTerm?.attributes?.weight ?? 999999
          ),

        // ------------------------------
        // Redni broj prostora
        // ------------------------------

        redniBroj:
          item.attributes
            ?.field_prostor_sprat_redni_broj ?? null,

        sortRedniBroj:
          Number(
            item.attributes
              ?.field_prostor_sprat_redni_broj ?? 999999
          ),

        // ------------------------------
        // Broj prostora
        // ------------------------------

        broj_prostora:
          item.attributes
            ?.field_prostor_broj ?? null,

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
            ?.field_prostor_vlasnik ?? null,

        korisnik:
          item.attributes
            ?.field_prostor_korisnik ?? null,

        telefon:
          item.attributes
            ?.field_prostor_telefon ?? null,

        email:
          item.attributes
            ?.field_prostor_email ?? null,

        pin:
          item.attributes
            ?.field_prostor_pin ?? null,

        // ------------------------------
        // Tip prostora
        // ------------------------------

        tip:
          tipTerm?.attributes?.name ?? null,
      };
    });

    // --------------------------------------------------
    // SORTIRANJE
    //
    // 1. Sprat
    // 2. Redni broj prostora na tom spratu
    // 3. Broj prostora
    // --------------------------------------------------

    sviProstori.sort((a: any, b: any) => {
      // 1. Sprat
      if (a.spratWeight !== b.spratWeight) {
        return a.spratWeight - b.spratWeight;
      }

      // 2. Redni broj prostora
      if (a.sortRedniBroj !== b.sortRedniBroj) {
        return a.sortRedniBroj - b.sortRedniBroj;
      }

      // 3. Broj prostora
      return String(a.broj_prostora ?? "").localeCompare(
        String(b.broj_prostora ?? ""),
        "sr",
        {
          numeric: true,
          sensitivity: "base",
        }
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

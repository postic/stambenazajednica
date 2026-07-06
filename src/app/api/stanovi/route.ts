import type { Stan } from "@/types/stan";
import type { VlasnikEntity } from "@/types/stan";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
      "http://localhost:8888";


    const response = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/stan?include=field_vlasnik&sort=field_sprat`
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
          error: "Greška pri dohvaćanju stanova",
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


    const allStanovi = json.data || [];


    // ==========================
    // STATISTIKA
    // ==========================

    const totalStanova = allStanovi.length;


    const totalStanara = allStanovi.reduce(
      (sum: number, item: any) =>
        sum +
        (item.attributes?.field_stan_broj_stanara ?? 0),
      0
    );


    const ukupnaKvadratura = allStanovi.reduce(
      (sum: number, item: any) =>
        sum +
        (item.attributes?.field_kvadratura ?? 0),
      0
    );


    // ==========================
    // PAGINATION
    // ==========================

    const total = allStanovi.length;

    const totalPages = Math.ceil(
      total / limit
    );


    const currentPageData = allStanovi.slice(
      offset,
      offset + limit
    );


    // ==========================
    // VLASNICI
    // ==========================

    const vlasniciMap: Map<string, VlasnikEntity> =
      new Map(
        (json.included || []).map(
          (item: any) => [
            item.id,
            item as VlasnikEntity,
          ]
        )
      );


    // ==========================
    // MAPIRANJE STANOVA
    // ==========================

    const stanovi: Stan[] =
      currentPageData.map((item: any) => {

        const vlasnikId =
          item.relationships
            ?.field_vlasnik
            ?.data
            ?.id;


        const vlasnikEntity =
          vlasnikId
            ? vlasniciMap.get(vlasnikId)
            : undefined;


        return {

          id: item.id,

          title:
            item.attributes?.title ?? "",


          body:
            item.attributes?.body?.value ?? "",


          created:
            item.attributes?.created ?? "",


          sprat:
            item.attributes?.field_sprat ?? null,


          kvadratura:
            item.attributes?.field_kvadratura ?? null,


          broj_stanara:
            item.attributes
              ?.field_stan_broj_stanara ?? 0,


          vlasnik:
            vlasnikEntity?.attributes
              ?.field_ime_prezime ??
            vlasnikEntity?.attributes
              ?.display_name ??
            vlasnikEntity?.attributes
              ?.name ??
            null,
        };
      });



    return new Response(
      JSON.stringify({

        data: stanovi,

        total,

        page,

        totalPages,


        // NOVO
        stats: {
          stanovi: totalStanova,
          stanari: totalStanara,
          kvadratura: ukupnaKvadratura,
        },

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
      "Server error fetching stanovi:",
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

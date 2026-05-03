import type { Stan } from "@/types/stan";
import type { VlasnikEntity } from "@/types/stan";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

    const response = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/stan?include=field_vlasnik&sort=field_sprat`
    );

    if (!response.ok) {
      const text = await response.text();
      console.log("Drupal API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Greška pri dohvaćanju stanova" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const json = await response.json();

    const total = (json.data || []).length;
    const totalPages = Math.ceil(total / limit);

    const currentPageData = (json.data || []).slice(offset, offset + limit);

    // ✅ Napravi mapu vlasnika sa tipom
    const vlasniciMap: Map<string, VlasnikEntity> = new Map(
      (json.included || []).map((item: any) => [item.id, item as VlasnikEntity])
    );

    // ✅ Mapiraj stanove
    const stanovi: Stan[] = currentPageData.map((item: any) => {
      const vlasnikId = item.relationships?.field_vlasnik?.data?.id;
      const vlasnikEntity = vlasniciMap.get(vlasnikId);

      return {
        id: item.id,
        title: item.attributes?.title || "",
        body: item.attributes?.body?.value || "",
        created: item.attributes?.created || "",
        sprat: item.attributes?.field_sprat ?? null,
        kvadratura: item.attributes?.field_kvadratura ?? null,
        broj_stanara: item.attributes.field_stan_broj_stanara,

        // Ako je node → title, ako je taxonomy → name
        vlasnik:
          vlasnikEntity?.attributes?.title ??
          vlasnikEntity?.attributes?.name ??
          null,
      };
    });

    return new Response(
      JSON.stringify({
        data: stanovi,
        total,
        page,
        totalPages,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log("Server error fetching stanovi:", error);
    return new Response(
      JSON.stringify({ error: "Interna greška servera" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

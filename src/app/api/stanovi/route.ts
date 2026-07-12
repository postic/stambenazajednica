import type { Stan } from "@/types/stan";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

    const response = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/stan?&sort=field_broj_stana,field_broj_stana_sufiks`
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

    // ✅ Mapiraj stanove
    const stanovi: Stan[] = currentPageData.map((item: any) => {

    return {
      id: item.id,
      title: item.attributes?.title || "",
      body: item.attributes?.body?.value || "",
      created: item.attributes?.created || "",
      sprat: item.attributes?.field_sprat ?? null,
      kvadratura: item.attributes?.field_kvadratura ?? null,
      broj_stanara: item.attributes.field_stan_broj_stanara,
      vlasnik: item.attributes?.field_vlasnik || null,
      stanari: item.attributes?.field_stanari || null,
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

interface Stan {
  id: string;
  title: string;
  body: string;
  created: string;
  sprat: number | null;
  kvadratura: number | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

    const response = await fetch(`${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/stan?include=field_tip_stana,field_vlasnik`);

    if (!response.ok) {
      const text = await response.text();
      console.error("Drupal API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Greška pri dohvaćanju stanova" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const total = data.meta?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // uzmi samo tekuću stranu
    const currentPageData = (data.data || []).slice(offset, offset + limit);

    const stanovi: Stan[] = currentPageData.map((item: any) => {

    return {
      id: item.id,
      title: item.attributes.title,
      created: item.attributes.created,
      sprat: item.attributes?.field_sprat ?? null,
      kvadratura: item.attributes?.field_kvadratura ?? null,
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
    console.error("Server error fetching stanovi:", error);
    return new Response(
      JSON.stringify({ error: "Interna greška servera" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

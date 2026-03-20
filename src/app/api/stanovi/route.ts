interface Stan {
  id: string;
  title: string;
  body: string;
  created: string;
  field_sprat: number | null;
  field_kvadratura: number | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    const DRUPAL_BASE_URL =
      process.env.DRUPAL_BASE_URL || "http://localhost:8888";

    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/stan?page[offset]=${offset}&page[limit]=${limit}`
    );

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

    const stanovi: Stan[] = (data.data || []).map((item: any) => ({
      id: item.id,
      title: item.attributes?.title ?? "",
      body: item.attributes?.body?.value ?? "",
      created: item.attributes?.created ?? "",
      field_sprat: item.attributes?.field_sprat ?? null,
      field_kvadratura: item.attributes?.field_kvadratura ?? null,
    }));

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

interface Dokument {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // page i limit iz query-ja (default: 1 i 5)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const DRUPAL_BASE_URL = process.env.DRUPAL_BASE_URL || "http://localhost:8888";

    // Fetch svih dokument (bez count=true)
    const response = await fetch(`${DRUPAL_BASE_URL}/jsonapi/node/dokument?include=field_tip_dokumenta`);

    if (!response.ok) {
      const text = await response.text();
      console.error("Drupal API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Greška pri dohvaćanju dokument" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // ukupno sednica
    const total = (data.data || []).length;
    const totalPages = Math.ceil(total / limit);

    // uzmi samo tekuću stranu
    const currentPageData = (data.data || []).slice(offset, offset + limit);

    const dokumenti: Dokument[] = currentPageData.map((item: any) => {

    // Type taxonomy term
    const typeRel = item.relationships?.field_tip_dokumenta?.data;
    const typeIncluded = typeRel && data.included?.find(
      (i: any) => i.type === typeRel.type && i.id === typeRel.id
    );
    const type = typeIncluded?.attributes?.name || "Nepoznat";

      return {
        id: item.id,
        title: item.attributes.title,
        body: item.attributes.body?.value || "",
        created: item.attributes.created,
        type,
      };
    });

    return new Response(
      JSON.stringify({
        data: dokumenti,
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
    console.error("Server error fetching sednice:", error);
    return new Response(
      JSON.stringify({ error: "Interna greška servera" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

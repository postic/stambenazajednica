import type { Anketa } from "@/types/anketa";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // page i limit iz query-ja (default: 1 i 5)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

    // Fetch svih anketa (bez count=true)
    const response = await fetch(`${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/anketa`);

    if (!response.ok) {
      const text = await response.text();
      console.log("Drupal API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Greška pri dohvaćanju sednica" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // ukupno sednica
    const total = (data.data || []).length;
    const totalPages = Math.ceil(total / limit);

    // uzmi samo tekuću stranu
    const currentPageData = (data.data || []).slice(offset, offset + limit);

    const ankete: Anketa[] = currentPageData.map((item: any) => {

      return {
        id: item.id,
        title: item.attributes.title,
        created: item.attributes.created,
        status: item.attributes.field_status_ankete ?? "",
      };
    });

    return new Response(
      JSON.stringify({
        data: ankete,
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
    console.log("Server error fetching anketa:", error);
    return new Response(
      JSON.stringify({ error: "Interna greška servera" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

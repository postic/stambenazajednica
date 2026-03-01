interface Kvar {
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
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    const DRUPAL_BASE_URL =
      process.env.DRUPAL_BASE_URL || "http://localhost:8888";

    // Fetch svih kvarova (bez count=true)
    const response = await fetch(`${DRUPAL_BASE_URL}/jsonapi/node/kvar?include=field_image`);

    if (!response.ok) {
      const text = await response.text();
      console.error("Drupal API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Greška pri dohvaćanju kvarova" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // ukupno kvarova
    const total = (data.data || []).length;
    const totalPages = Math.ceil(total / limit);

    // uzmi samo tekuću stranu
    const currentPageData = (data.data || []).slice(offset, offset + limit);

    const kvarovi: Kvar[] = currentPageData.map((item: any) => {
      let imageUrl: string | null = null;

      const imageRel = item.relationships?.field_image?.data;
      if (imageRel) {
        const fileObj = data.included?.find((i: any) => i.id === imageRel.id);
        if (fileObj?.attributes?.uri?.url) {
          imageUrl = `${DRUPAL_BASE_URL}${fileObj.attributes.uri.url}`;
        }
      }

      return {
        id: item.id,
        title: item.attributes.title,
        body: item.attributes.body?.value || "",
        created: item.attributes.created,
        image: imageUrl,
      };
    });

    return new Response(
      JSON.stringify({
        data: kvarovi,
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
    console.error("Server error fetching kvarovi:", error);
    return new Response(
      JSON.stringify({ error: "Interna greška servera" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

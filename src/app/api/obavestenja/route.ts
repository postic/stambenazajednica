interface Obavestenje {
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

    const NEXT_PUBLIC_DRUPAL_BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

    // Fetch svih obavestenja (bez count=true)
    const response = await fetch(`${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/obavestenje?include=field_type,field_image`);

    if (!response.ok) {
      const text = await response.text();
      console.error("Drupal API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Greška pri dohvaćanju obavestenja" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // ukupno obavestenja
    const total = (data.data || []).length;
    const totalPages = Math.ceil(total / limit);

    // uzmi samo tekuću stranu
    const currentPageData = (data.data || []).slice(offset, offset + limit);

    const obavestenja: Obavestenje[] = currentPageData.map((item: any) => {

    // Slika
    let imageUrl: string | null = null;
    const imageRel = item.relationships?.field_image?.data?.[0];
    if (imageRel && data.included) {
      const fileObj = data.included.find(
        (i: any) => i.type === "file--file" && i.id === imageRel.id
      );
      const fileUriValue = fileObj?.attributes?.uri?.value;
      if (fileUriValue) {
        const filePath = fileUriValue.replace("public://", "/sites/default/files/");
        imageUrl = `${NEXT_PUBLIC_DRUPAL_BASE_URL}${filePath}`;
      }
    }

      // Type taxonomy term
    const typeRel = item.relationships?.field_type?.data;
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
        data: obavestenja,
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
    console.error("Server error fetching obavestenja:", error);
    return new Response(
      JSON.stringify({ error: "Interna greška servera" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

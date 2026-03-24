export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // page i limit iz query-ja (default: 1 i 10)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

    // Fetch kvarova sa paging parametrima
    const response = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar?include=field_image&page[limit]=${limit}&page[offset]=${offset}`,
      {
        headers: { Accept: "application/vnd.api+json" },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Drupal API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Greška pri dohvaćanju kvarova" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // ukupno kvarova (ako JSON:API vraća meta)
    const total = data.meta?.count ?? (data.data || []).length;
    const totalPages = Math.ceil(total / limit);

    const kvarovi: Kvar[] = (data.data || []).map((item: any) => {
      // Image
      let imageUrl: string | null = null;
      const imageRel = item.relationships?.field_image?.data?.[0];
      if (imageRel && data.included) {
        const fileObj = data.included.find(
          (i: any) => i.type === "file--file" && i.id === imageRel.id
        );
        const fileUriValue = fileObj?.attributes?.uri?.value;
        if (fileUriValue) {
          const filePath = fileUriValue.replace(
            "public://",
            "/sites/default/files/"
          );
          imageUrl = `${NEXT_PUBLIC_DRUPAL_BASE_URL}${filePath}`;
        }
      }

      return {
        id: item.id,
        title: item.attributes.title ?? "",
        body: item.attributes.body?.value ?? "",
        created: item.attributes.created ?? "",
        status: item.attributes.field_status_kvara ?? "",
        prioritet: item.attributes.field_prioritet_kvara ?? "",
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

// /app/api/obavestenja/route.ts
interface Obavestenje {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string | null;
}

export async function GET(req: Request) {
  const url = `${process.env.DRUPAL_BASE_URL}/jsonapi/node/obavestenje?include=field_image`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("Drupal API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Greška pri dohvaćanju obaveštenja" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const obavestenja: Obavestenje[] = (data.data || []).map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value || "",
      created: item.attributes.created,
      image:
        item.relationships?.field_image?.data?.attributes?.uri?.url || null,
    }));

    return new Response(JSON.stringify(obavestenja), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Server error fetching obavestenja:", error);
    return new Response(
      JSON.stringify({ error: "Interna greška servera" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

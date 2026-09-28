import type { Projekat } from "@/types/projekat";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

    const response = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/projekat`
    );

    if (!response.ok) {
      const text = await response.text();

      console.log("Drupal API error:", response.status, text);

      return new Response(
        JSON.stringify({
          error: "Greška pri dohvaćanju projekata",
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    const total = (data.data || []).length;
    const totalPages = Math.ceil(total / limit);

    const currentPageData = (data.data || []).slice(
      offset,
      offset + limit
    );

    const projekti: Projekat[] = currentPageData.map((item: any) => {
      return {
        id: item.id,
        title: item.attributes.title,
        body: item.attributes.body?.value || "",
        created: item.attributes.created,

        // STATUS PROJEKTA
        status: item.attributes.field_projekat_status ?? "",
      };
    });

    return new Response(
      JSON.stringify({
        data: projekti,
        total,
        page,
        totalPages,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log("Server error fetching projekti:", error);

    return new Response(
      JSON.stringify({
        error: "Interna greška servera",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

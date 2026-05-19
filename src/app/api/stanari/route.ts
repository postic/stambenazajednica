import type { Stanar } from "@/types/stanar";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
      "http://localhost:8888";

    // Poziv custom Drupal endpointa
    const response = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/api/stanari`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();

      console.log("Drupal API error:", response.status, text);

      return new Response(
        JSON.stringify({
          error: "Greška pri dohvaćanju stanara",
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();

    //console.error('ERROR',data);

    // Drupal endpoint već vraća gotove rezultate
    const stanari: Stanar[] = (data.results || []).map((item: any) => ({
      id: item.uuid,
      ime_prezime: item.ime_prezime || "",
      created: item.created,
      status: Boolean(item.status),
      tip: Boolean(item.tip),
      stan: item.stan || "-",
      telefon: item.telefon || "-",
    }));

    return new Response(
      JSON.stringify({
        data: stanari,
        total: data.total || 0,
        page: data.page || page,
        totalPages: data.totalPages || 1,
        limit: data.limit || limit,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log("Server error fetching stanari:", error);

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

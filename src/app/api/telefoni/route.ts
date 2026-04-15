import type { Telefon } from "@/types/telefon";

// CORS helper
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// OPTIONS (preflight request)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const baseUrl =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

    const response = await fetch(`${baseUrl}/jsonapi/node/telefon`, {
      headers: {
        Accept: "application/vnd.api+json",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Drupal error" }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    const json = await response.json();

    const total = json.data?.length || 0;
    const totalPages = Math.ceil(total / limit);

    const slice = (json.data || []).slice(offset, offset + limit);

    const telefoni: Telefon[] = slice.map((item: any) => ({
      id: item.id,
      title: item.attributes?.title ?? "",
      phone:
        item.attributes?.field_phone?.value ??
        item.attributes?.field_phone ??
        "",
      created: item.attributes?.created ?? "",
    }));

    return new Response(
      JSON.stringify({
        data: telefoni,
        total,
        page,
        totalPages,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

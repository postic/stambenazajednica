// src/app/api/transakcije/route.ts

import { addRunningBalance } from "@/lib/transactions";

interface Transakcija {
  id: string;
  title: string;
  body?: string;
  amount: number;
  type?: string;
  created: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const offset = (page - 1) * limit;

    const NEXT_PUBLIC_DRUPAL_BASE_URL =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
      "http://localhost:8888";

    const response = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/transakcija?sort=-created`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "Drupal API error:",
        response.status,
        text
      );

      return new Response(
        JSON.stringify({
          error: "Greška pri dohvaćanju transakcija",
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const json = await response.json();

    const allTransactions: Transakcija[] = (
      json.data || []
    ).map((item: any) => ({
      id: item.id,
      title: item.attributes?.title ?? "",
      body: item.attributes?.body?.value ?? "",
      created: item.attributes?.created ?? "",
      type: item.attributes?.field_tip ?? "",
      amount: Number(item.attributes?.field_iznos ?? 0),
    }));

    // Izračunaj stanje za CELOKUPAN skup transakcija
    const withBalance = addRunningBalance(allTransactions);

    const total = withBalance.length;
    const totalPages = Math.ceil(total / limit);

    // Tek sada paginacija
    const paginated = withBalance.slice(
      offset,
      offset + limit
    );

    return new Response(
      JSON.stringify({
        data: paginated,
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
    console.error(
      "Server error fetching transakcije:",
      error
    );

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

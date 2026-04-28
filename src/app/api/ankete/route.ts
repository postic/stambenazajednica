import { NextRequest, NextResponse } from "next/server";
import type { Anketa, Opcija } from "@/types/anketa";

const DRUPAL_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const res = await fetch(`${DRUPAL_URL}/jsonapi/node/anketa?page[limit]=${limit}&page[offset]=${offset}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const json = await res.json();
    const total = json.meta?.count || json.data.length || 0;
    const totalPages = Math.ceil(total / limit);

    const ankete: Anketa[] = json.data.map((node: any) => ({
      id: node.id, // UUID
      title: node.attributes.title,
      //title: node.attributes.field_anketa_pitanje || "Bez pitanja",
      body: node.attributes.body?.value || "",
      created: node.attributes.created,
      status: node.attributes.field_status_ankete || undefined,
      options: Array.isArray(node.attributes.field_opcija_anketa)
        ? node.attributes.field_opcija_anketa.map((opt: string, index: number) => ({
            id: `${node.id}-${index}`,
            title: opt,
            anketaId: node.id,
            votes: 0,
            order: index,
          }))
        : [],
    }));

    return NextResponse.json({ data: ankete, total, page, totalPages });
  } catch (err) {
    console.error("Greška pri fetch-u anketa:", err);
    return NextResponse.json({ error: "Interna greška servera" }, { status: 500 });
  }
}

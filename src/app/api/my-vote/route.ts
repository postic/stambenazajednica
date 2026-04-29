import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { anketaId } = await req.json();

    // 🔥 FIX: await cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ vote: null });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const stanId = decoded.stan_id;

    const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;
    const drupalToken = process.env.DRUPAL_INTERNAL_TOKEN!;

    const res = await fetch(
      `${baseUrl}/jsonapi/node/glas?filter[field_glas_anketa.id]=${anketaId}&filter[field_glas_stanar.id]=${stanId}`,
      {
        headers: {
          "X-API-KEY": drupalToken,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    const vote = data?.data?.[0] || null;

    return NextResponse.json({ vote });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}

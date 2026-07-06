import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { anketaId } = await req.json();
    const cookieStore = await cookies();
    const auth = cookieStore.get("next_auth");

    if (!auth) {
      return NextResponse.json({ vote: null });
    }

    const user = JSON.parse(auth.value);
    const uid = user.uid;
    const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;

    const res = await fetch(
      `${baseUrl}/jsonapi/node/glas?filter[field_glas_anketa.id]=${anketaId}&filter[field_glas_stanar.id]=${uid}`,
      {
        headers: {
          Cookie: auth, // 🔥 KLJUČNO
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    return NextResponse.json({
      vote: data?.data?.[0] || null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}

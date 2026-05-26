import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies(); // ✅ OBAVEZNO await

  const auth = cookieStore.get("next_auth");

  if (!auth) {
    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: JSON.parse(auth.value),
  });
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {

  const cookieStore = cookies(); // ❗ bez await

  const auth = cookieStore.get("next_auth");

  if (!auth) {
    return NextResponse.json(
      { logged_in: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    logged_in: true,
    user: JSON.parse(auth.value),
  });
}

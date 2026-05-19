import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username i lozinka su obavezni" },
        { status: 400 }
      );
    }

    // 👉 OVDE zoveš backend (Drupal / API / custom auth)
    const res = await fetch(
      `https://dev-stambena-zajednica.pantheonsite.io/api/login-upravnik`,
      //`${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/login-upravnik`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Neispravni kredencijali" },
        { status: 401 }
      );
    }

    /**
     * 👉 Očekujemo da backend vrati npr:
     * {
     *   user: { id, name, role },
     *   token: "jwt..."
     * }
     */

    const response = NextResponse.json({
      user: data.user,
    });

    /**
     * 🔐 SET COOKIE (BITNO ZA REAL LOGIN)
     * Ako koristiš JWT iz backenda
     */
    if (data.token) {
      response.cookies.set("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

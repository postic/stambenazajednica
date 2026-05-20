import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json(
        { error: "PIN je obavezan" },
        { status: 400 }
      );
    }

    const API = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;
    const res = await fetch(
      `${API}/api/pin-login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      }
    );

    const data = await res.json();

    //console.info('TK',data.token);

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Neispravan PIN" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: data.user,
    });

    /**
     * 🔐 TOKEN COOKIE (stanar)
     */

    //console.error('TK',data.token);

    //if (data.token) {
      response.cookies.set("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    //}

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

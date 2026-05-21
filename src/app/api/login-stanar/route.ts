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

    const res = await fetch(`${API}/api/pin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const data = await res.json();

    //console.log("DT:", data);

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Neispravan PIN" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: data.user,
    });

    // 🔐 STORE JWT IN HTTPONLY COOKIE
    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: true,//process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    return response;

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

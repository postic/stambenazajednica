import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { role } = body;

    let res: Response;
    let data: any;

    // 🏢 =========================
    // STANAR LOGIN (PIN)
    // =========================
    if (role === "stanar") {
      res = await fetch(
        `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/stan-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: body.identifier,
            pin: body.pin,
          }),
        }
      );
    }

    // 🏛 =========================
    // UPRAVNIK LOGIN (OAuth)
    // =========================
    else if (role === "upravnik") {
      const oauthBody = new URLSearchParams({
        grant_type: "password",
        client_id: process.env.DRUPAL_CLIENT_ID!,
        client_secret: process.env.DRUPAL_CLIENT_SECRET!,
        username: body.identifier,
        password: body.password,
      });

      res = await fetch(
        `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/oauth/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: oauthBody,
        }
      );
    }

    // ❌ invalid role
    else {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const text = await res.text();

    //console.log("ROLE:", role);
    //console.log("STATUS:", res.status);
    //console.log("RESPONSE:", text);

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Login failed",
          details: text,
        },
        { status: res.status }
      );
    }

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid server response" },
        { status: 500 }
      );
    }

    if (!data?.access_token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user ?? null,
      role,
    });

    console.log("RESPONSE:", text);

    response.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

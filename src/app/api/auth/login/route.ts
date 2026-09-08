import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const drupalRes = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await drupalRes.json();

    if (!drupalRes.ok) {
      return NextResponse.json(data, {
        status: drupalRes.status,
      });
    }

    // ================================================
    // NEXT SESSION
    // ================================================

    const res = NextResponse.json({
      user: data,
    });

    res.cookies.set({
      name: "next_auth",
      value: JSON.stringify({
        uid: data.uid,
        name: data.name,
        roles: data.roles,
        picture: data.picture,
      }),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    // ================================================
    // DRUPAL SESSION COOKIE
    // ================================================

    const setCookies = drupalRes.headers.getSetCookie();

    for (const cookie of setCookies) {
      const cookiePair = cookie.split(";")[0];

      const separatorIndex = cookiePair.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const name = cookiePair
        .slice(0, separatorIndex)
        .trim();

      const value = cookiePair
        .slice(separatorIndex + 1)
        .trim();

      if (!name || !value) {
        continue;
      }

      res.cookies.set({
        name,
        value,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }

    return res;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Greška prilikom prijave",
      },
      { status: 500 }
    );
  }
}

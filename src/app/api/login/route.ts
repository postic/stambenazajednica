import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { identifier, password, role, pin } = await req.json();

  // 🏢 =========================
  // STAN LOGIN (PIN varijanta)
  // 🏢 =========================
  if (role === "stanar") {
    try {
      // 👉 OVDE ide tvoja logika:
      // - Drupal custom endpoint
      // - ili provera field "field_pin"
      // - ili external service

//console.error('identifier',identifier);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/stan-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            pin,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        return NextResponse.json(
          { error: "Neispravan PIN ili stan nalog" },
          { status: 401 }
        );
      }

      const response = NextResponse.json({ success: true });

      response.cookies.set("access_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response;
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Greška pri stan login-u" },
        { status: 500 }
      );
    }
  }

  // 🏢 =========================
  // DRUPAL OAUTH LOGIN (default)
  // 🏢 =========================
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: process.env.DRUPAL_CLIENT_ID!,
    client_secret: process.env.DRUPAL_CLIENT_SECRET!,
    username: identifier,
    password,
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/oauth/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.access_token) {
      return NextResponse.json(
        { error: "Neispravno korisničko ime/email ili lozinka" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Greška pri povezivanju sa Drupal-om" },
      { status: 500 }
    );
  }
}

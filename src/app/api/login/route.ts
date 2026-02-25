import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { identifier, password } = await req.json();

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: process.env.DRUPAL_CLIENT_ID!,
    client_secret: process.env.DRUPAL_CLIENT_SECRET!,
    username: identifier, // username ili email ako Drupal podržava
    password,
  });

  try {
    const res = await fetch(`${process.env.DRUPAL_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json();
    console.log("OAuth response:", res.status, data);

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

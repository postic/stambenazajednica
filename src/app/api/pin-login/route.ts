import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/pin-login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: body.pin }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "Login failed" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    user: data.user,
  });

  response.cookies.set("auth", data.token ?? "logged", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

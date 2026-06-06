import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const body = await req.json();

  const drupalRes = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      credentials: "include", // 🔥 KLJUČNO
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

  // 🔥 ovde pravimo NEXT session (NE Drupal cookie)
  const res = NextResponse.json({
    user: data,
  });

  // console.error('DATA',data);

  // 🧠 jednostavan auth cookie (Next owns session)
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

  return res;
}

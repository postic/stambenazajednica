import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// 🔵 decode OAuth JWT payload (bez verify)
function decodeOAuth(token: string) {
  try {
    return JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // 🟢 =========================
  // 1. STANAR (tvoj JWT)
  // =========================
  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    return NextResponse.json({
      user: {
        uid: String(decoded.uid),
        name: decoded.name || "Stanar",
        role: decoded.roles?.[0] || "stanar",
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          decoded.name || "Stanar"
        )}`,
      },
    });
  } catch {
    // nije JWT → ide OAuth
  }

  // 🔵 =========================
  // 2. UPRAVNIK (OAuth)
  // =========================
  const oauth = decodeOAuth(token);

  if (!oauth?.sub) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    // 🔥 NAJSTABILNIJE: Drupal custom endpoint /api/me
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("UPRAVNIK /api/me ERROR:", text);

      return NextResponse.json({ user: null }, { status: 401 });
    }

    const data = await res.json();

    return NextResponse.json({
      user: {
        uid: String(data.uid),
        name: data.name || "Upravnik",
        role: "upravnik",
        picture:
          data.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            data.name || "Upravnik"
          )}`,
      },
    });
  } catch (err) {
    console.error("UPRAVNIK ERROR:", err);

    return NextResponse.json({ user: null }, { status: 401 });
  }
}

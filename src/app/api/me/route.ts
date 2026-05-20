
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // 🔴 NO TOKEN → normal response
  if (!token) {
    return NextResponse.json({
      success: false,
      user: null,
    });
  }

  // =========================
  // 1. TRY JWT AUTH FIRST
  // =========================
  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    return NextResponse.json({
      success: true,
      user: {
        uid: String(decoded.uid),
        name: decoded.name || "User",
        role: decoded.roles?.[0] || "stanar",
        picture: decoded.picture || null,
      },
    });
  } catch (err) {
    console.error("JWT VERIFY FAILED:", err);
  }

  // =========================
  // 2. OPTIONAL OAUTH FALLBACK
  // =========================
  try {
    const API = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

    const res = await fetch(`${API}/api/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      user: {
        uid: String(data.uid),
        name: data.name || "Upravnik",
        role: "upravnik",
        picture:
          data.picture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            data.name || "Upravnik"
          )}`,
      },
    });
  } catch (err) {
    console.error("OAUTH FALLBACK FAILED:", err);

    return NextResponse.json({
      success: false,
      user: null,
    });
  }
}

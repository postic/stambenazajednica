import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const API = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

    const res = await fetch(`/user/login?_format=json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: username, pass: password }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Login error" },
        { status: 401 }
      );
    }

    // ❌ NO JWT COOKIE
    // ❌ NO token storage

    return NextResponse.json({
      user: data.current_user,
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

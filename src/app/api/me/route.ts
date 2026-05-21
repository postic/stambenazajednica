import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const API = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

  if (!API) {
    return NextResponse.json(
      { error: "Missing DRUPAL base URL" },
      { status: 500 }
    );
  }

  // 🔐 uzmi Bearer token iz request-a
  const authHeader = req.headers.get("token");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const res = await fetch(`${API}/api/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authHeader,
    },
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return NextResponse.json(data, {
    status: res.status,
  });
}

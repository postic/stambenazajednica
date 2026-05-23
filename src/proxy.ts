import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚫 PWA bypass
  if (
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icons/")
  ) {
    return NextResponse.next();
  }

  // ✅ NEVER block Next.js internals / API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
  ];

  const isPublic = publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/session-check`,
      {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      }
    );

    // ⚠️ SOFT FAIL (ne redirect odmah agresivno)
    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();

  } catch (e) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

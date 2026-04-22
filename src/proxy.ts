import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚫 PWA files MUST bypass auth
  if (
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icons/")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;

  const publicPaths = ["/login", "/register", "/forgot-password"];
  const isPublic = publicPaths.some(path =>
    pathname.startsWith(path)
  );

  // 🔐 auth guard
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔁 redirect logged-in users away from login
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|manifest.json|sw.js|icons).*)",
  ],
};

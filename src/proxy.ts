import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  const publicPaths = ["/login", "/register", "/forgot-password"];
  const isPublic = publicPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Ako nije ulogovan i ide na zaštićenu rutu → redirect na login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Ako je ulogovan i ide na login → redirect na dashboard
  if (token && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"], // sve osim _next, api i favicon
};

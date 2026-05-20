import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret"
);

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

  const token = req.cookies.get("token")?.value;

  const publicPaths = ["/login", "/register", "/forgot-password"];
  const isPublic = publicPaths.some(path =>
    pathname.startsWith(path)
  );

  // 🔐 ako nema tokena
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔐 ako postoji token → validacija
  /*if (token) {
    try {
      await jwtVerify(token, secret);
    } catch (e) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.set("token", "", { expires: new Date(0) });
      return res;
    }
  }*/

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|manifest.json|sw.js|icons).*)",
  ],
};

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  // Brišemo access token
  response.cookies.set("access_token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });

  // Brišemo refresh token (ako postoji)
  response.cookies.set("refresh_token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // uzmi cookie (npr. Drupal session ili custom token)
    const sessionCookie = req.cookies.get("session")?.value;

    return NextResponse.json({
      loggedIn: !!sessionCookie,
      session: sessionCookie ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

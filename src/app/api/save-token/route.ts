import { NextResponse } from "next/server";

let tokens: string[] = []; // ZA TEST (kasnije DB)

export async function POST(req: Request) {
  const body = await req.json();

  if (body.token && !tokens.includes(body.token)) {
    tokens.push(body.token);
  }

  return NextResponse.json({
    success: true,
    count: tokens.length,
  });
}

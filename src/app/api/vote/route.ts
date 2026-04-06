"use server";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { anketaId, opcijaId } = await req.json();

    if (!anketaId || !opcijaId) {
      return NextResponse.json({ error: "Missing anketaId or opcijaId" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;
    const drupalUser = process.env.DRUPAL_USER;
    const drupalPass = process.env.DRUPAL_PASS;

    if (!baseUrl || !drupalUser || !drupalPass) {
      return NextResponse.json({ error: "Missing Drupal environment variables" }, { status: 500 });
    }

    // Basic Auth header server-side
    const authHeader = `Basic ${Buffer.from(`${drupalUser}:${drupalPass}`).toString("base64")}`;

    // console.error('authHeader',authHeader);
    // console.error('drupalUser',drupalUser);
    // console.error('drupalPass',drupalPass);
    // console.error('AnketaId',anketaId);
    // console.error('OpcijaId',opcijaId);

    const res = await fetch(`${baseUrl}/jsonapi/node/glas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          type: "node--glas",
          attributes: {
            title: "glas",
          },
          relationships: {
            field_glas_anketa: {
              data: { type: "node--anketa", id: anketaId },
            },
            field_glas_opcija: {
              data: { type: "node--opcija", id: opcijaId },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text(); // <-- ovde dohvatamo odgovor
      console.error("Drupal error:", text);
      return NextResponse.json({ error: "Drupal error", details: text }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Server error:", e.message);
    return NextResponse.json({ error: "Server error", details: e.message }, { status: 500 });
  }
}

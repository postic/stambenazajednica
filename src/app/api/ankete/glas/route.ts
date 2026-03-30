import { NextRequest, NextResponse } from "next/server";

const DRUPAL_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;
const DRUPAL_AUTH = process.env.DRUPAL_AUTH_TOKEN; // Bearer token sa pravom da menja node

export async function POST(req: NextRequest) {
  try {
    const { anketaId, opcijaId } = await req.json();

    if (!anketaId || !opcijaId) {
      return NextResponse.json({ error: "Nedostaju anketaId ili opcijaId" }, { status: 400 });
    }

    // 1️⃣ Fetch trenutnu opciju da uzmemo trenutni broj glasova
    const opcijaRes = await fetch(`${DRUPAL_URL}/jsonapi/node/opcija/${opcijaId}`);
    if (!opcijaRes.ok) {
      return NextResponse.json({ error: `Opcija nije pronađena (${opcijaRes.status})` }, { status: 404 });
    }

    const opcijaJson = await opcijaRes.json();
    const currentVotes = opcijaJson.data.attributes.field_votes || 0;

    // 2️⃣ Increment i PATCH nazad u Drupal
    const patchRes = await fetch(`${DRUPAL_URL}/jsonapi/node/opcija/${opcijaId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${DRUPAL_AUTH}`,
      },
      body: JSON.stringify({
        data: {
          type: "node--opcija",
          id: opcijaId,
          attributes: {
            field_votes: currentVotes + 1,
          },
        },
      }),
    });

    if (!patchRes.ok) {
      return NextResponse.json({ error: `Neuspešno ažuriranje glasa (${patchRes.status})` }, { status: 500 });
    }

    return NextResponse.json({ votes: currentVotes + 1 });
  } catch (err) {
    console.error("Greška pri glasanju:", err);
    return NextResponse.json({ error: "Interna greška servera" }, { status: 500 });
  }
}

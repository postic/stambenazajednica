import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

  try {
    const [
      obavestenja,
      ankete,
      sednice,
      prostori,
      transakcije,
      telefoni,
      dokumenti,
      forum_topic,
    ] = await Promise.all([
      fetch(`${base}/jsonapi/node/obavestenje`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/anketa`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/sednica`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/prostor`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/transakcija?page[limit]=1000`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/telefon`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/dokument`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/forum_topic`).then((r) => r.json()),
    ]);

    return NextResponse.json({
      obavestenja: obavestenja?.data?.length ?? 0,
      ankete: ankete?.data?.length ?? 0,
      sednice: sednice?.data?.length ?? 0,
      prostori: prostori?.data?.length ?? 0,
      transakcije: transakcije?.data?.length ?? 0,
      telefoni: telefoni?.data?.length ?? 0,
      dokumenti: dokumenti?.data?.length ?? 0,
      forum_topic: forum_topic?.data?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}

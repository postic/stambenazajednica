import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

  try {
    const [
      kvarovi,
      obavestenja,
      ankete,
      sednice,
      stanari,
      stanovi,
      transakcije,
      telefoni,
      dokumenti,
    ] = await Promise.all([
      fetch(`${base}/jsonapi/node/kvar`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/obavestenje`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/anketa`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/sednica`).then((r) => r.json()),
      fetch(`${base}/api/stanari`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/prostor`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/transakcija`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/telefon`).then((r) => r.json()),
      fetch(`${base}/jsonapi/node/dokument`).then((r) => r.json()),
    ]);

    return NextResponse.json({
      kvarovi: kvarovi?.data?.length ?? 0,
      obavestenja: obavestenja?.data?.length ?? 0,
      ankete: ankete?.data?.length ?? 0,
      sednice: sednice?.data?.length ?? 0,
      stanari: stanari?.total ?? 0,
      stanovi: stanovi?.data?.length ?? 0,
      transakcije: transakcije?.data?.length ?? 0,
      telefoni: telefoni?.data?.length ?? 0,
      dokumenti: dokumenti?.data?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // =========================
    // 1. INPUT
    // =========================
    const { anketaId, opcijaId } = await req.json();

    if (!anketaId || !opcijaId) {
      return NextResponse.json(
        { error: "Missing anketaId or opcijaId" },
        { status: 400 }
      );
    }

    // =========================
    // 2. COOKIE PARSING
    // =========================
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { error: "No cookies found" },
        { status: 401 }
      );
    }

    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { error: "No access token" },
        { status: 401 }
      );
    }

    // =========================
    // 3. JWT VERIFY → stan_id
    // =========================
    let stanId: string;

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      stanId = decoded.stan_id;

      if (!stanId) {
        return NextResponse.json(
          { error: "Missing stan_id in token" },
          { status: 401 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // =========================
    // 4. DRUPAL CONFIG
    // =========================
    const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;
    const drupalToken = process.env.DRUPAL_INTERNAL_TOKEN;

    if (!baseUrl || !drupalToken) {
      return NextResponse.json(
        { error: "Missing Drupal config" },
        { status: 500 }
      );
    }

    const headers = {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      "X-API-KEY": drupalToken,
    };

    // =========================
    // 5. CREATE GLAS
    // =========================
    const res = await fetch(`${baseUrl}/jsonapi/node/glas`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "node--glas",
          attributes: {
            title: "glas",
          },
          relationships: {
            field_glas_stanar: {
              data: {
                type: "node--stan",
                id: stanId,
              },
            },
            field_glas_anketa: {
              data: {
                type: "node--anketa",
                id: anketaId,
              },
            },
            field_glas_opcija: {
              data: {
                type: "node--opcija",
                id: opcijaId,
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Drupal create glas error:", text);

      return NextResponse.json(
        { error: "Drupal create glas error", details: text },
        { status: 500 }
      );
    }

    // =========================
    // 6. GET OPCIJA (trenutni broj glasova)
    // =========================
    const opcijaRes = await fetch(
      `${baseUrl}/jsonapi/node/opcija/${opcijaId}`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!opcijaRes.ok) {
      const text = await opcijaRes.text();

      return NextResponse.json(
        { error: "Failed to fetch opcija", details: text },
        { status: 500 }
      );
    }

    const opcijaData = await opcijaRes.json();

    const currentVotes =
      opcijaData?.data?.attributes?.field_opcija_broj_glasova || 0;

    // =========================
    // 7. UPDATE OPCIJA
    // =========================
    const updateRes = await fetch(
      `${baseUrl}/jsonapi/node/opcija/${opcijaId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          data: {
            type: "node--opcija",
            id: opcijaId,
            attributes: {
              field_opcija_broj_glasova: currentVotes + 1,
            },
          },
        }),
      }
    );

    if (!updateRes.ok) {
      const text = await updateRes.text();

      console.error("Drupal update opcija error:", text);

      return NextResponse.json(
        { error: "Failed to update opcija", details: text },
        { status: 500 }
      );
    }

    // =========================
    // 8. SUCCESS
    // =========================
    return NextResponse.json({
      success: true,
      votes: currentVotes + 1,
    });

  } catch (e: any) {
    console.error("Server error:", e.message);

    return NextResponse.json(
      { error: "Server error", details: e.message },
      { status: 500 }
    );
  }
}

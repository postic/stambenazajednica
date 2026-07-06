import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {

    const cookieStore = await cookies();
    const auth = cookieStore.get("next_auth");

    if (!auth) {
      return NextResponse.json({ vote: null });
    }

    const user = JSON.parse(auth.value);
    const uid = user.uid;
    const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;

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
    // 4. CHECK IF USER ALREADY VOTED
    // =========================
    const checkRes = await fetch(
      `${baseUrl}/jsonapi/node/glas?filter[field_glas_anketa.id]=${anketaId}&filter[field_glas_stanar.id]=${uid}`,
      {
        headers: {
          Cookie: auth, // 🔥 KLJUČNO
        },
        cache: "no-store",
      }
    );

    const checkData = await checkRes.json();

    if (checkData?.data?.length > 0) {
      return NextResponse.json(
        { error: "Već ste glasali" },
        { status: 400 }
      );
    }

    // =========================
    // 5. CREATE GLAS
    // =========================
    const res = await fetch(`${baseUrl}/jsonapi/node/glas`, {
      method: "POST",
      headers: {
        Cookie: auth, // 🔥 KLJUČNO
      },
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
                id: uid,
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
      console.log("Drupal create glas error:", text);

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
        headers: {
          Cookie: auth, // 🔥 KLJUČNO
        },
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
        headers: {
          Cookie: auth, // 🔥 KLJUČNO
        },
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

      console.log("Drupal update opcija error:", text);

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
    console.log("Server error:", e.message);

    return NextResponse.json(
      { error: "Server error", details: e.message },
      { status: 500 }
    );
  }
}

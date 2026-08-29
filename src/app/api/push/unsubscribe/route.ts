import { NextRequest, NextResponse } from "next/server";

// =========================================================
// CONFIGURATION
// =========================================================

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// =========================================================
// TYPES
// =========================================================

interface NextAuthUser {
  uid: string | number;
  name?: string;
  email?: string;
}

interface UnsubscribeRequest {
  endpoint?: string;
}

// =========================================================
// READ NEXT_AUTH COOKIE
// =========================================================

function getNextAuthUser(
  request: NextRequest
): NextAuthUser | null {
  try {
    const cookie =
      request.cookies.get("next_auth")?.value;

    console.log(
      "[Push] next_auth cookie postoji:",
      Boolean(cookie)
    );

    if (!cookie) {
      console.error(
        "[Push] next_auth cookie nije pronađen."
      );

      return null;
    }

    const decoded =
      decodeURIComponent(cookie);

    // =====================================================
    // TRY JSON
    // =====================================================

    try {
      const parsed =
        JSON.parse(decoded);

      console.log(
        "[Push] next_auth JSON:",
        {
          uid:
            parsed?.uid ??
            parsed?.user?.uid ??
            null,

          name:
            parsed?.name ??
            parsed?.user?.name ??
            null,
        }
      );

      if (
        parsed &&
        (
          parsed.uid !== undefined ||
          parsed.user?.uid !== undefined
        )
      ) {
        return parsed.user || parsed;
      }
    } catch {
      console.log(
        "[Push] next_auth nije JSON, koristim parser."
      );
    }

    // =====================================================
    // OBJECT FORMAT
    //
    // Object uid:"226" name:"S5"
    // =====================================================

    const uidMatch =
      decoded.match(
        /uid["']?\s*[:=]\s*["']?(\d+)["']?/
      );

    const nameMatch =
      decoded.match(
        /name["']?\s*[:=]\s*["']?([^,"'}]+)/
      );

    if (!uidMatch) {
      console.error(
        "[Push] UID nije pronađen u next_auth cookie-u."
      );

      return null;
    }

    const user: NextAuthUser = {
      uid: uidMatch[1],
      name: nameMatch?.[1]?.trim(),
    };

    console.log(
      "[Push] Korisnik pronađen:",
      {
        uid: user.uid,
        name: user.name,
      }
    );

    return user;
  } catch (error) {
    console.error(
      "[Push] Greška pri čitanju next_auth:",
      error
    );

    return null;
  }
}

// =========================================================
// POST /api/push/unsubscribe
// =========================================================

export async function POST(
  request: NextRequest
) {
  console.log(
    "================================================="
  );

  console.log(
    "[Push] POST /api/push/unsubscribe"
  );

  console.log(
    "================================================="
  );

  try {
    // =====================================================
    // 1. AUTH USER
    // =====================================================

    const user =
      getNextAuthUser(request);

    if (!user) {
      console.error(
        "[Push] Korisnik nije pronađen."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Korisnik nije prijavljen.",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // 2. UID
    // =====================================================

    const uid =
      Number(user.uid);

    if (
      !Number.isInteger(uid) ||
      uid <= 0
    ) {
      console.error(
        "[Push] Neispravan UID:",
        user.uid
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Neispravan korisnički ID.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "[Push] UID:",
      uid
    );

    // =====================================================
    // 3. READ BODY
    // =====================================================

    const body =
      (await request.json()) as UnsubscribeRequest;

    console.log(
      "[Push] Request body:",
      body
    );

    // =====================================================
    // 4. VALIDATE ENDPOINT
    // =====================================================

    const endpoint =
      body?.endpoint;

    if (
      typeof endpoint !== "string" ||
      !endpoint.trim()
    ) {
      console.error(
        "[Push] Endpoint nije prosleđen."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Push endpoint nije prosleđen.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "[Push] Endpoint:",
      endpoint
    );

    // =====================================================
    // 5. CALL DRUPAL
    // =====================================================

    const drupalUrl =
      `${DRUPAL_BASE_URL}/api/webpush/unsubscribe`;

    console.log(
      "[Push] Drupal endpoint:",
      drupalUrl
    );

    const drupalResponse =
      await fetch(
        drupalUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            user_id: uid,
            endpoint: endpoint,
          }),

          cache: "no-store",
        }
      );

    // =====================================================
    // 6. READ DRUPAL RESPONSE
    // =====================================================

    const responseText =
      await drupalResponse.text();

    console.log(
      "[Push] Drupal HTTP status:",
      drupalResponse.status
    );

    console.log(
      "[Push] Drupal response:",
      responseText
    );

    let drupalData:
      | Record<string, unknown>
      | null = null;

    try {
      drupalData =
        responseText
          ? JSON.parse(responseText)
          : null;
    } catch {
      drupalData = {
        raw: responseText,
      };
    }

    // =====================================================
    // 7. DRUPAL ERROR
    // =====================================================

    if (!drupalResponse.ok) {
      console.error(
        "[Push] Drupal nije obrisao subscription.",
        {
          status:
            drupalResponse.status,

          data:
            drupalData,
        }
      );

      return NextResponse.json(
        {
          success: false,

          error:
            typeof drupalData?.error ===
            "string"
              ? drupalData.error
              : "Drupal nije uspeo da obriše subscription.",

          drupalStatus:
            drupalResponse.status,

          drupal:
            drupalData,
        },
        {
          status: 502,
        }
      );
    }

    // =====================================================
    // 8. SUCCESS
    // =====================================================

    console.log(
      "[Push] ========================================="
    );

    console.log(
      "[Push] SUBSCRIPTION USPEŠNO OBRISAN"
    );

    console.log(
      "[Push] UID:",
      uid
    );

    console.log(
      "[Push] ========================================="
    );

    return NextResponse.json({
      success: true,

      uid,

      message:
        "Web Push subscription je uspešno uklonjen.",

      drupal:
        drupalData,
    });
  } catch (error) {
    console.error(
      "[Push] ========================================="
    );

    console.error(
      "[Push] UNSUBSCRIBE ERROR"
    );

    console.error(error);

    console.error(
      "[Push] ========================================="
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Greška prilikom uklanjanja Web Push subscription-a.",
      },
      {
        status: 500,
      }
    );
  }
}

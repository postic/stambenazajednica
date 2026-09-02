import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

interface NextAuthUser {
  uid: string | number;
  name?: string;
  email?: string;
}

function getNextAuthUser(
  request: NextRequest
): NextAuthUser | null {
  try {
    const cookie =
      request.cookies.get("next_auth")?.value;

    if (!cookie) {
      return null;
    }

    const decoded =
      decodeURIComponent(cookie);

    try {
      const parsed = JSON.parse(decoded);

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
      // Fallback parser.
    }

    const uidMatch =
      decoded.match(
        /uid["']?\s*[:=]\s*["']?(\d+)["']?/
      );

    const nameMatch =
      decoded.match(
        /name["']?\s*[:=]\s*["']?([^,"'}]+)/
      );

    if (!uidMatch) {
      return null;
    }

    return {
      uid: uidMatch[1],
      name: nameMatch?.[1]?.trim(),
    };
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    // =====================================================
    // 1. GET LOGGED USER
    // =====================================================

    const user =
      getNextAuthUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          subscribed: false,
          error:
            "Korisnik nije prijavljen.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const uid =
      Number(user.uid);

    if (
      !Number.isInteger(uid) ||
      uid <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          subscribed: false,
          error:
            "Neispravan korisnički ID.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    console.log(
      "🔍 Provera Web Push statusa za UID:",
      uid
    );

    // =====================================================
    // 2. DRUPAL URL
    // =====================================================

    const drupalUrl =
      `${DRUPAL_BASE_URL}/api/webpush/status?uid=${encodeURIComponent(uid)}`;

    console.log(
      "📤 Drupal status URL:",
      drupalUrl
    );

    // =====================================================
    // 3. CALL DRUPAL
    // =====================================================

    const drupalResponse =
      await fetch(
        drupalUrl,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",
          },

          cache: "no-store",
        }
      );

    const responseText =
      await drupalResponse.text();

    console.log(
      "📥 Drupal status response:",
      responseText
    );

    // =====================================================
    // 4. PARSE
    // =====================================================

    let drupalData:
      | {
          success?: boolean;
          subscribed?: boolean;
          uid?: number;
          subscription_id?: number;
          endpoint?: string;
          error?: string;
        }
      | null = null;

    try {
      drupalData =
        responseText
          ? JSON.parse(responseText)
          : null;
    } catch {
      drupalData = null;
    }

    // =====================================================
    // 5. DRUPAL ERROR
    // =====================================================

    if (!drupalResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          subscribed: false,
          error:
            drupalData?.error ||
            "Drupal nije uspeo da proveri subscription.",
          drupalStatus:
            drupalResponse.status,
        },
        {
          status: 502,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // =====================================================
    // 6. RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        subscribed:
          Boolean(
            drupalData?.subscribed
          ),

        uid,

        subscription_id:
          drupalData?.subscription_id ??
          null,

        endpoint:
          drupalData?.endpoint ??
          null,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "❌ Push status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        subscribed: false,
        error:
          error instanceof Error
            ? error.message
            : "Greška prilikom provere subscription statusa.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

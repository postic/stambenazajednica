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

interface PushKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: PushKeys;
}

interface SubscribeRequest {
  subscription?: PushSubscriptionData;

  endpoint?: string;
  expirationTime?: number | null;
  keys?: PushKeys;
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

    console.log(
      "[Push] next_auth cookie length:",
      decoded.length
    );

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
        return (
          parsed.user || parsed
        );
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

    const user = {
      uid: uidMatch[1],
      name:
        nameMatch?.[1]?.trim(),
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
// POST
// =========================================================

export async function POST(
  request: NextRequest
) {
  console.log(
    "================================================="
  );

  console.log(
    "[Push] POST /api/push/subscribe"
  );

  console.log(
    "================================================="
  );

  try {
    // =====================================================
    // 1. CHECK DRUPAL URL
    // =====================================================

    console.log(
      "[Push] Drupal URL:",
      DRUPAL_BASE_URL
    );

    // =====================================================
    // 2. AUTH USER
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
    // 3. UID
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
          userUid:
            user.uid,
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
    // 4. READ BODY
    // =====================================================

    const body =
      (await request.json()) as SubscribeRequest;

    console.log(
      "[Push] Request body keys:",
      Object.keys(body || {})
    );

    // =====================================================
    // 5. EXTRACT SUBSCRIPTION
    // =====================================================

    let subscription:
      | PushSubscriptionData
      | null = null;

    if (body.subscription) {
      subscription =
        body.subscription;

      console.log(
        "[Push] Subscription pronađen u body.subscription."
      );
    } else if (
      body.endpoint &&
      body.keys
    ) {
      subscription = {
        endpoint:
          body.endpoint,

        expirationTime:
          body.expirationTime ??
          null,

        keys: body.keys,
      };

      console.log(
        "[Push] Subscription pronađen direktno u body-u."
      );
    }

    if (!subscription) {
      console.error(
        "[Push] Subscription nije pronađen."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Push subscription nije prosleđen.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // 6. VALIDATE ENDPOINT
    // =====================================================

    if (
      typeof subscription.endpoint !==
        "string" ||
      !subscription.endpoint
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Push endpoint nije validan.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // 7. VALIDATE KEYS
    // =====================================================

    if (
      !subscription.keys ||
      typeof subscription.keys.p256dh !==
        "string" ||
      !subscription.keys.p256dh
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "p256dh key nije validan.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof subscription.keys.auth !==
        "string" ||
      !subscription.keys.auth
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "auth key nije validan.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "[Push] Subscription validan."
    );

    console.log(
      "[Push] Endpoint:",
      subscription.endpoint
    );

    console.log(
      "[Push] p256dh postoji:",
      Boolean(
        subscription.keys.p256dh
      )
    );

    console.log(
      "[Push] auth postoji:",
      Boolean(
        subscription.keys.auth
      )
    );

    // =====================================================
    // 8. PREPARE DRUPAL PAYLOAD
    // =====================================================

    const drupalPayload = {
      user_id: uid,

      endpoint:
        subscription.endpoint,

      expirationTime:
        subscription.expirationTime ??
        null,

      keys: {
        p256dh:
          subscription.keys.p256dh,

        auth:
          subscription.keys.auth,
      },
    };

    console.log(
      "[Push] Šaljem subscription Drupal-u:"
    );

    console.log({
      user_id:
        drupalPayload.user_id,

      endpoint:
        drupalPayload.endpoint,

      expirationTime:
        drupalPayload.expirationTime,

      hasP256dh:
        Boolean(
          drupalPayload.keys.p256dh
        ),

      hasAuth:
        Boolean(
          drupalPayload.keys.auth
        ),
    });

    // =====================================================
    // 9. CALL DRUPAL
    // =====================================================

    const drupalUrl =
      `${DRUPAL_BASE_URL}/api/webpush/subscribe`;

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

          body:
            JSON.stringify(
              drupalPayload
            ),

          cache:
            "no-store",
        }
      );

    // =====================================================
    // 10. READ DRUPAL RESPONSE
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
          ? JSON.parse(
              responseText
            )
          : null;
    } catch {
      drupalData = {
        raw:
          responseText,
      };
    }

    // =====================================================
    // 11. DRUPAL ERROR
    // =====================================================

    if (!drupalResponse.ok) {
      console.error(
        "[Push] Drupal nije prihvatio subscription.",
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
              : "Drupal nije uspeo da sačuva subscription.",

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
    // 12. SUCCESS
    // =====================================================

    console.log(
      "[Push] ========================================="
    );

    console.log(
      "[Push] SUBSCRIPTION USPEŠNO SAČUVAN"
    );

    console.log(
      "[Push] UID:",
      uid
    );

    console.log(
      "[Push] Drupal response:",
      drupalData
    );

    console.log(
      "[Push] ========================================="
    );

    return NextResponse.json({
      success: true,

      uid,

      message:
        "Web Push subscription je uspešno sačuvan u Drupal bazi.",

      drupal:
        drupalData,
    });
  } catch (error) {
    console.error(
      "[Push] ========================================="
    );

    console.error(
      "[Push] SUBSCRIBE ERROR"
    );

    console.error(
      error
    );

    console.error(
      "[Push] ========================================="
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Greška prilikom čuvanja Web Push subscription-a.",
      },
      {
        status: 500,
      }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

// ==================================================
// TYPES
// ==================================================

interface PushSubscriptionData {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

interface PushRequestBody {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };

  // Podržavamo i:
  subscription?: PushSubscriptionData;
}

// ==================================================
// GET USER FROM next_auth
// ==================================================

function getNextAuthUser(
  request: NextRequest
) {
  try {
    const cookie =
      request.cookies.get("next_auth")?.value;

    if (!cookie) {
      return null;
    }

    const decoded =
      decodeURIComponent(cookie);

    // ==================================================
    // DIRECT JSON
    // ==================================================

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
      // Nastavljamo sa regex proverom.
    }

    // ==================================================
    // REGEX UID
    // ==================================================

    const uidMatch =
      decoded.match(
        /uid["']?\s*[:=]\s*["']?(\d+)["']?/
      );

    const nameMatch =
      decoded.match(
        /name["']?\s*[:=]\s*["']?([^,"'}]+)/
      );

    const emailMatch =
      decoded.match(
        /email["']?\s*[:=]\s*["']?([^,"'}]+)/
      );

    if (!uidMatch) {
      return null;
    }

    return {
      uid: uidMatch[1],
      name: nameMatch?.[1]?.trim(),
      email: emailMatch?.[1]?.trim(),
    };

  } catch (error) {

    console.error(
      "[Push Subscribe] Greška pri čitanju next_auth:",
      error
    );

    return null;
  }
}

// ==================================================
// POST
// ==================================================

export async function POST(
  request: NextRequest
) {

  try {

    console.log(
      "[Push Subscribe] ==============================="
    );

    console.log(
      "[Push Subscribe] POST"
    );

    // ==================================================
    // USER
    // ==================================================

    const user =
      getNextAuthUser(request);

    if (!user) {

      console.error(
        "[Push Subscribe] Korisnik nije prijavljen."
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

    // ==================================================
    // UID
    // ==================================================

    const uid =
      Number(user.uid);

    if (
      !Number.isInteger(uid) ||
      uid <= 0
    ) {

      console.error(
        "[Push Subscribe] Neispravan UID:",
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
      "[Push Subscribe] UID:",
      uid
    );

    // ==================================================
    // READ BODY
    // ==================================================

    let body: PushRequestBody;

    try {

      body =
        await request.json();

    } catch (error) {

      console.error(
        "[Push Subscribe] JSON greška:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Neispravan JSON zahtev.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "[Push Subscribe] Primljeni body:",
      body
    );

    // ==================================================
    // SUPPORT BOTH FORMATS
    //
    // FORMAT 1:
    //
    // {
    //   endpoint,
    //   keys
    // }
    //
    // FORMAT 2:
    //
    // {
    //   subscription: {
    //     endpoint,
    //     keys
    //   }
    // }
    // ==================================================

    const subscription =
      body.subscription || body;

    // ==================================================
    // ENDPOINT
    // ==================================================

    const endpoint =
      typeof subscription.endpoint ===
        "string"
        ? subscription.endpoint.trim()
        : "";

    console.log(
      "[Push Subscribe] Endpoint:",
      endpoint
        ? endpoint
        : "NEMA ENDPOINTA"
    );

    if (!endpoint) {

      console.error(
        "[Push Subscribe] Push subscription endpoint nedostaje.",
        {
          body,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Push subscription endpoint nedostaje.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // KEYS
    // ==================================================

    const p256dh =
      subscription.keys?.p256dh;

    const auth =
      subscription.keys?.auth;

    if (
      typeof p256dh !== "string" ||
      !p256dh
    ) {

      console.error(
        "[Push Subscribe] p256dh key nedostaje."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Push subscription p256dh key nedostaje.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof auth !== "string" ||
      !auth
    ) {

      console.error(
        "[Push Subscribe] auth key nedostaje."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Push subscription auth key nedostaje.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // DRUPAL PAYLOAD
    // ==================================================

    const drupalPayload = {

      user_id:
        uid,

      endpoint:
        endpoint,

      expirationTime:
        subscription.expirationTime ??
        null,

      keys: {

        p256dh:
          p256dh,

        auth:
          auth,
      },
    };

    console.log(
      "[Push Subscribe] Drupal payload:",
      {
        user_id:
          drupalPayload.user_id,

        endpoint:
          drupalPayload.endpoint,

        has_p256dh:
          Boolean(
            drupalPayload.keys.p256dh
          ),

        has_auth:
          Boolean(
            drupalPayload.keys.auth
          ),
      }
    );

    // ==================================================
    // DRUPAL ENDPOINT
    // ==================================================

    const drupalUrl =
      `${DRUPAL_BASE_URL}/api/webpush/subscribe`;

    console.log(
      "[Push Subscribe] Drupal endpoint:",
      drupalUrl
    );

    // ==================================================
    // SEND TO DRUPAL
    // ==================================================

    const drupalResponse =
      await fetch(
        drupalUrl,
        {
          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Accept":
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

    // ==================================================
    // DRUPAL RESPONSE
    // ==================================================

    const responseText =
      await drupalResponse.text();

    console.log(
      "[Push Subscribe] Drupal HTTP status:",
      drupalResponse.status
    );

    console.log(
      "[Push Subscribe] Drupal response:",
      responseText
    );

    // ==================================================
    // PARSE
    // ==================================================

    let drupalData:
      | {
          success?: boolean;
          action?: string;
          id?: number;
          user_id?: number;
          endpoint?: string;
          error?: string;
        }
      | null = null;

    try {

      drupalData =
        responseText
          ? JSON.parse(
              responseText
            )
          : null;

    } catch {

      console.error(
        "[Push Subscribe] Drupal response nije validan JSON."
      );

    }

    // ==================================================
    // DRUPAL ERROR
    // ==================================================

    if (!drupalResponse.ok) {

      console.error(
        "[Push Subscribe] Drupal nije prihvatio subscription.",
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
            drupalData?.error ||
            "Drupal nije prihvatio subscription.",

          drupalStatus:
            drupalResponse.status,

          drupalData:
            drupalData,
        },
        {
          status: 502,
        }
      );
    }

    // ==================================================
    // SUCCESS FALSE
    // ==================================================

    if (
      drupalData &&
      drupalData.success === false
    ) {

      return NextResponse.json(
        {
          success: false,

          error:
            drupalData.error ||
            "Drupal nije sačuvao subscription.",

          drupalData,
        },
        {
          status: 502,
        }
      );
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "[Push Subscribe] Subscription uspešno sačuvan.",
      {
        uid,
        action:
          drupalData?.action,
        id:
          drupalData?.id,
      }
    );

    return NextResponse.json(
      {
        success:
          true,

        user_id:
          uid,

        action:
          drupalData?.action ||
          "saved",

        id:
          drupalData?.id ??
          null,

        endpoint:
          drupalData?.endpoint ||
          endpoint,
      },
      {
        status:
          200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );

  } catch (error) {

    console.error(
      "[Push Subscribe] Fatal error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error instanceof Error
            ? error.message
            : "Greška prilikom čuvanja push subscription-a.",
      },
      {
        status:
          500,
      }
    );
  }
}

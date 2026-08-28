```ts
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// =========================================================
// CONFIGURATION
// =========================================================

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "";

const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT ||
  "mailto:admin@example.com";

const PUSH_API_SECRET =
  process.env.PUSH_API_SECRET || "";

// =========================================================
// TYPES
// =========================================================

interface PushKeys {
  p256dh: string;
  auth: string;
}

interface DrupalSubscription {
  id: number;
  user_id: number;
  endpoint: string;
  expirationTime?: number | null;
  keys: PushKeys;
}

interface PushRequest {
  title?: string;
  body?: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

// =========================================================
// VAPID
// =========================================================

if (
  VAPID_PUBLIC_KEY &&
  VAPID_PRIVATE_KEY
) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// =========================================================
// AUTH
// =========================================================

function isAuthorized(
  request: NextRequest
): boolean {
  if (!PUSH_API_SECRET) {
    console.error(
      "[Push Send] PUSH_API_SECRET nije podešen."
    );

    return false;
  }

  const authorization =
    request.headers.get(
      "authorization"
    );

  return (
    authorization ===
    `Bearer ${PUSH_API_SECRET}`
  );
}

// =========================================================
// GET SUBSCRIPTIONS FROM DRUPAL
// =========================================================

async function getSubscriptions(): Promise<
  DrupalSubscription[]
> {
  const url =
    `${DRUPAL_BASE_URL}/api/webpush/subscriptions`;

  console.log(
    "[Push Send] Učitavam subscriptions:",
    url
  );

  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        Accept:
          "application/json",
      },

      cache: "no-store",
    });

  const text =
    await response.text();

  console.log(
    "[Push Send] Drupal status:",
    response.status
  );

  if (!response.ok) {
    throw new Error(
      `Drupal subscriptions error: HTTP ${response.status} ${text}`
    );
  }

  let data: unknown;

  try {
    data =
      text
        ? JSON.parse(text)
        : null;
  } catch {
    throw new Error(
      "Drupal je vratio neispravan JSON."
    );
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Drupal response nije validan objekat."
    );
  }

  const result =
    data as {
      success?: boolean;
      count?: number;
      subscriptions?: DrupalSubscription[];
    };

  if (
    !Array.isArray(
      result.subscriptions
    )
  ) {
    throw new Error(
      "Drupal response ne sadrži subscriptions."
    );
  }

  return result.subscriptions;
}

// =========================================================
// DELETE INVALID SUBSCRIPTION
// =========================================================

async function deleteSubscription(
  subscription: DrupalSubscription
) {
  try {
    const url =
      `${DRUPAL_BASE_URL}/api/webpush/unsubscribe`;

    await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Accept:
          "application/json",
      },

      body: JSON.stringify({
        user_id:
          subscription.user_id,

        endpoint:
          subscription.endpoint,
      }),

      cache: "no-store",
    });

    console.log(
      "[Push Send] Nevažeći subscription uklonjen:",
      subscription.id
    );
  } catch (error) {
    console.error(
      "[Push Send] Greška prilikom brisanja subscription-a:",
      error
    );
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
    "[Push Send] POST /api/push/send"
  );

  console.log(
    "================================================="
  );

  try {
    // =====================================================
    // 1. AUTHORIZATION
    // =====================================================

    if (!isAuthorized(request)) {
      console.error(
        "[Push Send] Unauthorized."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // 2. VAPID CHECK
    // =====================================================

    if (
      !VAPID_PUBLIC_KEY ||
      !VAPID_PRIVATE_KEY
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "VAPID ključevi nisu podešeni.",
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // 3. READ REQUEST
    // =====================================================

    const data =
      (await request.json()) as PushRequest;

    const title =
      typeof data.title === "string" &&
      data.title.trim()
        ? data.title.trim()
        : "Obaveštenje";

    const body =
      typeof data.body === "string"
        ? data.body.trim()
        : "";

    const url =
      typeof data.url === "string" &&
      data.url.trim()
        ? data.url.trim()
        : "/";

    const icon =
      typeof data.icon === "string" &&
      data.icon.trim()
        ? data.icon.trim()
        : "/icons/icon-192.png";

    const badge =
      typeof data.badge === "string" &&
      data.badge.trim()
        ? data.badge.trim()
        : "/icons/icon-192.png";

    const tag =
      typeof data.tag === "string" &&
      data.tag.trim()
        ? data.tag.trim()
        : "general";

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Body notifikacije je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // 4. PAYLOAD
    // =====================================================

    const payload =
      JSON.stringify({
        title,
        body,
        url,
        icon,
        badge,
        tag,
      });

    // =====================================================
    // 5. GET ALL SUBSCRIPTIONS
    // =====================================================

    const subscriptions =
      await getSubscriptions();

    console.log(
      "[Push Send] Broj subscription-a:",
      subscriptions.length
    );

    // =====================================================
    // 6. NO SUBSCRIPTIONS
    // =====================================================

    if (
      subscriptions.length === 0
    ) {
      return NextResponse.json({
        success: true,

        total: 0,

        sent: 0,

        failed: 0,

        removed: 0,

        message:
          "Nema aktivnih push subscription-a.",
      });
    }

    // =====================================================
    // 7. SEND
    // =====================================================

    let sent = 0;
    let failed = 0;
    let removed = 0;

    for (
      const subscription
      of subscriptions
    ) {
      try {
        if (
          !subscription.endpoint ||
          !subscription.keys?.p256dh ||
          !subscription.keys?.auth
        ) {
          failed++;
          continue;
        }

        await webpush.sendNotification(
          {
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
          },
          payload
        );

        sent++;

        console.log(
          "[Push Send] Poslato korisniku:",
          subscription.user_id
        );
      } catch (error: unknown) {
        failed++;

        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error
            ? (
                error as {
                  statusCode?: number;
                }
              ).statusCode
            : undefined;

        console.error(
          "[Push Send] Greška za subscription:",
          subscription.id,
          statusCode
        );

        // =================================================
        // INVALID SUBSCRIPTION
        // =================================================

        if (
          statusCode === 404 ||
          statusCode === 410
        ) {
          await deleteSubscription(
            subscription
          );

          removed++;
        }
      }
    }

    // =====================================================
    // 8. RESULT
    // =====================================================

    console.log(
      "================================================="
    );

    console.log(
      "[Push Send] ZAVRŠENO"
    );

    console.log({
      total:
        subscriptions.length,

      sent,

      failed,

      removed,
    });

    console.log(
      "================================================="
    );

    return NextResponse.json({
      success: true,

      total:
        subscriptions.length,

      sent,

      failed,

      removed,

      message:
        `Push poslato. Uspešno: ${sent}, neuspešno: ${failed}.`,
    });
  } catch (error) {
    console.error(
      "[Push Send] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Greška prilikom slanja push notifikacije.",
      },
      {
        status: 500,
      }
    );
  }
}
```

import { NextRequest, NextResponse } from "next/server";

// =========================================================
// CONFIGURATION
// =========================================================

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

const PUSH_API_SECRET =
  process.env.PUSH_API_SECRET || "";

// =========================================================
// TYPES
// =========================================================

interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface DrupalPushSubscription {
  id: number;
  user_id: number;
  endpoint: string;
  expirationTime?: number | null;
  keys: PushSubscriptionKeys;
}

interface DrupalSubscriptionsResponse {
  success: boolean;
  count: number;
  subscriptions: DrupalPushSubscription[];
}

interface SendPushRequest {
  title?: string;
  body?: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

// =========================================================
// POST /api/push/send
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
    // =======================================================
    // 1. CHECK SECRET
    // =======================================================

    if (!PUSH_API_SECRET) {
      console.error(
        "[Push Send] PUSH_API_SECRET nije konfigurisan."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Push API secret nije konfigurisan.",
        },
        {
          status: 500,
        }
      );
    }

    // =======================================================
    // 2. AUTHORIZATION
    // =======================================================

    const authorization =
      request.headers.get(
        "authorization"
      );

    const expectedAuthorization =
      `Bearer ${PUSH_API_SECRET}`;

    if (
      authorization !==
      expectedAuthorization
    ) {
      console.error(
        "[Push Send] Unauthorized request."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "[Push Send] Authorization OK."
    );

    // =======================================================
    // 3. READ REQUEST BODY
    // =======================================================

    let body:
      | SendPushRequest
      | null = null;

    try {
      body =
        await request.json();
    }
    catch {
      body = null;
    }

    // =======================================================
    // 4. NOTIFICATION
    // =======================================================

    const title =
      body?.title ||
      "Nova uplata";

    const notificationBody =
      body?.body ||
      "Evidentirana je nova uplata.";

    const url =
      body?.url ||
      "/uplate";

    const icon =
      body?.icon ||
      "/icons/icon-192.png";

    const badge =
      body?.badge ||
      "/icons/icon-192.png";

    const tag =
      body?.tag ||
      "webpush";

    console.log(
      "[Push Send] Notification:",
      {
        title,
        body: notificationBody,
        url,
        icon,
        badge,
        tag,
      }
    );

    // =======================================================
    // 5. LOAD SUBSCRIPTIONS FROM DRUPAL
    // =======================================================

    const subscriptionsUrl =
      `${DRUPAL_BASE_URL}/api/webpush/subscriptions`;

    console.log(
      "[Push Send] Loading subscriptions:"
    );

    console.log(
      subscriptionsUrl
    );

    const subscriptionsResponse =
      await fetch(
        subscriptionsUrl,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",
          },

          cache:
            "no-store",
        }
      );

    const subscriptionsText =
      await subscriptionsResponse.text();

    console.log(
      "[Push Send] Drupal subscriptions HTTP status:",
      subscriptionsResponse.status
    );

    // =======================================================
    // 6. DRUPAL ERROR
    // =======================================================

    if (
      !subscriptionsResponse.ok
    ) {
      console.error(
        "[Push Send] Drupal subscriptions request failed:",
        subscriptionsText
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "Drupal nije uspeo da vrati Web Push subscriptions.",

          drupalStatus:
            subscriptionsResponse.status,

          drupalResponse:
            subscriptionsText,
        },
        {
          status: 502,
        }
      );
    }

    // =======================================================
    // 7. PARSE DRUPAL JSON
    // =======================================================

    let drupalData:
      | DrupalSubscriptionsResponse;

    try {
      drupalData =
        JSON.parse(
          subscriptionsText
        ) as DrupalSubscriptionsResponse;
    }
    catch {
      console.error(
        "[Push Send] Drupal response nije validan JSON."
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "Drupal subscriptions response nije validan JSON.",

          drupalResponse:
            subscriptionsText,
        },
        {
          status: 502,
        }
      );
    }

    // =======================================================
    // 8. VALIDATE DRUPAL RESPONSE
    // =======================================================

    if (
      !drupalData ||
      !Array.isArray(
        drupalData.subscriptions
      )
    ) {
      console.error(
        "[Push Send] Drupal response nema subscriptions niz."
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "Drupal response nema validan subscriptions niz.",

          drupal:
            drupalData,
        },
        {
          status: 502,
        }
      );
    }

    const subscriptions =
      drupalData.subscriptions;

    console.log(
      "[Push Send] Broj subscription-a:",
      subscriptions.length
    );

    // =======================================================
    // 9. NO SUBSCRIPTIONS
    // =======================================================

    if (
      subscriptions.length ===
      0
    ) {
      console.log(
        "[Push Send] Nema aktivnih subscription-a."
      );

      return NextResponse.json({
        success: true,

        total: 0,

        sent: 0,

        failed: 0,

        message:
          "Nema aktivnih Web Push subscription-a.",
      });
    }

    // =======================================================
    // 10. IMPORT WEB-PUSH
    // =======================================================

    const webpush =
      await import(
        "web-push"
      );

    // =======================================================
    // 11. VAPID
    // =======================================================

    const vapidPublicKey =
      process.env
        .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const vapidPrivateKey =
      process.env
        .VAPID_PRIVATE_KEY;

    const vapidSubject =
      process.env
        .VAPID_SUBJECT ||
      "mailto:admin@example.com";

    if (
      !vapidPublicKey ||
      !vapidPrivateKey
    ) {
      console.error(
        "[Push Send] VAPID ključevi nisu konfigurisanI."
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "VAPID ključevi nisu konfigurisani.",
        },
        {
          status: 500,
        }
      );
    }

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    console.log(
      "[Push Send] VAPID konfiguracija OK."
    );

    // =======================================================
    // 12. PAYLOAD
    // =======================================================

    const pushPayload =
      JSON.stringify({
        title,

        body:
          notificationBody,

        url,

        icon,

        badge,

        tag,
      });

    // =======================================================
    // 13. SEND
    // =======================================================

    let sent = 0;

    let failed = 0;

    const results: Array<{
      id: number;
      user_id: number;
      success: boolean;
      status?: number;
      error?: string;
    }> = [];

    for (
      const subscription
      of subscriptions
    ) {

      console.log(
        "[Push Send] Obrada subscription-a:",
        {
          id:
            subscription.id,

          user_id:
            subscription.user_id,
        }
      );

      // =====================================================
      // VALIDATE
      // =====================================================

      if (
        !subscription.endpoint
      ) {
        failed++;

        results.push({
          id:
            subscription.id,

          user_id:
            subscription.user_id,

          success:
            false,

          error:
            "Endpoint nedostaje.",
        });

        continue;
      }

      if (
        !subscription.keys ||
        !subscription.keys.p256dh ||
        !subscription.keys.auth
      ) {
        failed++;

        results.push({
          id:
            subscription.id,

          user_id:
            subscription.user_id,

          success:
            false,

          error:
            "Push keys nedostaju.",
        });

        console.error(
          "[Push Send] Push keys nedostaju:",
          {
            id:
              subscription.id,

            user_id:
              subscription.user_id,
          }
        );

        continue;
      }

      // =====================================================
      // WEB PUSH SUBSCRIPTION
      // =====================================================

      const pushSubscription = {
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

      // =====================================================
      // SEND NOTIFICATION
      // =====================================================

      try {
        const response =
          await webpush.sendNotification(
            pushSubscription,
            pushPayload
          );

        sent++;

        console.log(
          "[Push Send] Push uspešno poslat:",
          {
            id:
              subscription.id,

            user_id:
              subscription.user_id,

            status:
              response.statusCode,
          }
        );

        results.push({
          id:
            subscription.id,

          user_id:
            subscription.user_id,

          success:
            true,

          status:
            response.statusCode,
        });
      }
      catch (error) {
        failed++;

        let status:
          | number
          | undefined;

        let message =
          "Unknown push error.";

        if (
          error &&
          typeof error ===
            "object"
        ) {
          const pushError =
            error as {
              statusCode?: number;
              message?: string;
            };

          status =
            pushError.statusCode;

          message =
            pushError.message ||
            message;
        }
        else if (
          error instanceof Error
        ) {
          message =
            error.message;
        }

        console.error(
          "[Push Send] Push slanje neuspešno:",
          {
            id:
              subscription.id,

            user_id:
              subscription.user_id,

            status,

            error:
              message,
          }
        );

        results.push({
          id:
            subscription.id,

          user_id:
            subscription.user_id,

          success:
            false,

          status,

          error:
            message,
        });
      }
    }

    // =======================================================
    // 14. FINAL RESULT
    // =======================================================

    console.log(
      "================================================="
    );

    console.log(
      "[Push Send] ZAVRŠENO"
    );

    console.log(
      "[Push Send] Total:",
      subscriptions.length
    );

    console.log(
      "[Push Send] Sent:",
      sent
    );

    console.log(
      "[Push Send] Failed:",
      failed
    );

    console.log(
      "================================================="
    );

    return NextResponse.json({
      success:
        sent > 0,

      total:
        subscriptions.length,

      sent,

      failed,

      notification: {
        title,

        body:
          notificationBody,

        url,

        icon,

        badge,

        tag,
      },

      results,
    });
  }
  catch (error) {
    console.error(
      "[Push Send] ========================================="
    );

    console.error(
      "[Push Send] FATAL ERROR"
    );

    console.error(
      error
    );

    console.error(
      "[Push Send] ========================================="
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Greška prilikom slanja Web Push notifikacije.",
      },
      {
        status: 500,
      }
    );
  }
}

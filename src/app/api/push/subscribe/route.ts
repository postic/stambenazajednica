import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type NextAuthUser = {
  uid: string;
  name?: string;
};

type PushSubscriptionPayload = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

async function getNextAuthUser(): Promise<NextAuthUser | null> {
  const cookieStore = await cookies();

  const authCookie = cookieStore.get("next_auth");

  if (!authCookie?.value) {
    return null;
  }

  try {
    const user = JSON.parse(
      authCookie.value
    ) as NextAuthUser;

    if (!user?.uid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "next_auth cookie parse error:",
      error
    );

    return null;
  }
}

export async function POST(request: Request) {
  try {
    // =====================================================
    // 1. PROVERA PRIJAVLJENOG KORISNIKA
    // =====================================================

    const user = await getNextAuthUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Morate biti prijavljeni da biste uključili push obaveštenja.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 2. DRUPAL URL
    // =====================================================

    const drupalUrl =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

    if (!drupalUrl) {
      console.error(
        "NEXT_PUBLIC_DRUPAL_BASE_URL nije definisan."
      );

      return NextResponse.json(
        {
          error:
            "Drupal URL nije konfigurisan.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 3. READ SUBSCRIPTION
    // =====================================================

    const subscription =
      (await request.json()) as PushSubscriptionPayload;

    const endpoint =
      subscription?.endpoint;

    const p256dh =
      subscription?.keys?.p256dh;

    const auth =
      subscription?.keys?.auth;

    if (!endpoint) {
      return NextResponse.json(
        {
          error:
            "Push subscription nema endpoint.",
        },
        { status: 400 }
      );
    }

    if (!p256dh || !auth) {
      return NextResponse.json(
        {
          error:
            "Push subscription nema potrebne ključeve.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 4. POZIV TVOG CUSTOM DRUPAL WEBPUSH MODULA
    // =====================================================

    const response = await fetch(
      `${drupalUrl}/api/webpush/subscribe`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body: JSON.stringify({
          user_id: String(user.uid),

          endpoint,

          expirationTime:
            subscription.expirationTime ??
            null,

          p256dh,

          auth,
        }),

        cache: "no-store",
      }
    );

    // =====================================================
    // 5. DRUPAL RESPONSE
    // =====================================================

    const responseText =
      await response.text();

    let drupalData: unknown = null;

    try {
      drupalData =
        responseText
          ? JSON.parse(responseText)
          : null;
    } catch {
      drupalData =
        responseText;
    }

    // =====================================================
    // 6. DRUPAL ERROR
    // =====================================================

    if (!response.ok) {
      console.error(
        "Drupal Web Push subscribe error:",
        {
          status: response.status,
          response: drupalData,
          userId: user.uid,
        }
      );

      return NextResponse.json(
        {
          error:
            "Drupal nije prihvatio push subscription.",

          status:
            response.status,

          details:
            drupalData,
        },
        {
          status: response.status,
        }
      );
    }

    // =====================================================
    // 7. SUCCESS
    // =====================================================

    console.log(
      "Push subscription successfully registered:",
      {
        userId: user.uid,
        endpoint,
      }
    );

    return NextResponse.json({
      success: true,

      userId: String(user.uid),

      message:
        "Push subscription je uspešno registrovan.",

      data:
        drupalData,
    });
  } catch (error) {
    // =====================================================
    // 8. UNEXPECTED ERROR
    // =====================================================

    console.error(
      "POST /api/push/subscribe error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Greška prilikom registracije push obaveštenja.",

        details:
          error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

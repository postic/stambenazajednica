import webpush from "@/lib/webPush";
import { NextResponse } from "next/server";

let subscription: PushSubscription | null = null;

export async function POST() {
  if (!subscription) {
    return NextResponse.json(
      {
        error:
          "Nema registrovanog push subscription-a.",
      },
      { status: 400 }
    );
  }

  try {
    const payload = JSON.stringify({
      title: "Nova poruka",
      body: "Test Web Push notifikacija",
      url: "/moja-obavestenja",
    });

    const response =
      await webpush.sendNotification(
        subscription as any,
        payload
      );

    return NextResponse.json({
      success: true,
      statusCode: response.statusCode,
    });
  } catch (error) {
    console.error(
      "Web Push send error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Slanje Web Push notifikacije nije uspelo.",
      },
      { status: 500 }
    );
  }
}

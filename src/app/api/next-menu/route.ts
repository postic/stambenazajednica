import { NextResponse } from "next/server";

export async function GET() {
  try {
    const drupalUrl =
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/next-menu`;

    const response = await fetch(drupalUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Drupal menu error",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Next menu proxy error:", error);

    return NextResponse.json(
      { error: "Failed to load Drupal menu" },
      { status: 500 }
    );
  }
}

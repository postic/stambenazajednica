export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/zgrada-config`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Drupal error: ${response.status}`);
    }

    const data = await response.json();

    return Response.json({
      door_code: data.door_code ?? "*****",
    });
  } catch (error) {
    console.error("Zgrada config error:", error);

    return Response.json(
      {
        door_code: "****",
      },
      { status: 500 }
    );
  }
}

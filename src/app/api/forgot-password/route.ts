export async function POST(req: Request) {
  const { email } = await req.json();

  const response = await fetch(
    `${process.env.DRUPAL_BASE_URL}/user/password?_format=json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: email }),
    }
  );

  if (!response.ok) {
    return Response.json(
      { error: "Greška prilikom slanja emaila." },
      { status: 400 }
    );
  }

  return Response.json({
    message: "Ako email postoji, link za reset je poslat.",
  });
}

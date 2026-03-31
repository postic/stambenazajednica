export async function POST(req: Request) {
  const { anketaId, opcijaId } = await req.json();

  try {
    // 👉 1. (opciono) proveri da li već postoji glas

    // 👉 2. napravi glas u Drupal-u
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/glas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${process.env.DRUPAL_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            type: "node--glas",
            attributes: {
              title: "glas",
            },
            relationships: {
              field_glas_anketa: {
                data: {
                  type: "node--anketa",
                  id: anketaId,
                },
              },
              field_glas_opcija: {
                data: {
                  type: "node--opcija",
                  id: opcijaId,
                },
              },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      return Response.json({ error: "Drupal error" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

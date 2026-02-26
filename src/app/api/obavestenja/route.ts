import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.DRUPAL_BASE_URL}/jsonapi/node/obavestenje?sort=-created&include=field_image`,
      { cache: "no-store" }
    );

    const data = await res.json();

    const news = data.data.map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.processed,
      created: item.attributes.created,
      image:
        item.relationships?.field_image?.data
          ? data.included.find(
              (i: any) => i.id === item.relationships.field_image.data.id
            )?.attributes?.uri?.url
          : null,
    }));

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json(
      { error: "Greška pri učitavanju vesti" },
      { status: 500 }
    );
  }
}

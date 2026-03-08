// lib/getObavestenja.ts

export interface Obavestenje {
  id: string;
  title: string;
  body: string;
  created: string;
  slug: string;
  image?: string;
}

export async function getObavestenja(): Promise<Obavestenje[]> {
  const res = await fetch(
    `${process.env.DRUPAL_BASE_URL}/jsonapi/node/obavestenje?include=field_image&sort=-created`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    console.error("Fetch failed:", res.status);
    return [];
  }

  const json = await res.json();

  return json.data.map((item: any) => {
    const imageRel = item.relationships?.field_image?.data;
    let imageUrl: string | undefined = undefined;

    if (imageRel && json.included) {
      const includedImage = json.included.find(
        (i: any) => i.id === imageRel.id
      );
      if (includedImage) {
        imageUrl = `${process.env.DRUPAL_BASE_URL}${includedImage.attributes.uri.url}`;
      }
    }

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      slug: item.attributes.path?.alias ?? "",
      image: imageUrl,
    };
  });
}

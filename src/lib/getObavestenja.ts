// lib/getObavestenja.ts
export async function getObavestenja(): Promise<Obavestenje[]> {
  const res = await fetch(
    `${process.env.DRUPAL_BASE_URL}/jsonapi/node/obavestenje?include=field_image&sort=-created`,
    { cache: "no-store" }
  );

  const json = await res.json();

  return json.data.map((item: any) => ({
    id: item.id,
    title: item.attributes.title,
    body: item.attributes.body?.value ?? "",
    created: item.attributes.created,
    slug: item.attributes.path.alias,
    image:
      item.relationships.field_image?.data
        ? `${process.env.DRUPAL_BASE_URL}${json.included.find(
            (i: any) => i.id === item.relationships.field_image.data.id
          )?.attributes.uri.url}`
        : undefined,
  }));
}

const API_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

export async function getDokument(id: string) {
  const res = await fetch(
    `${API_URL}/jsonapi/node/dokument/${id}?include=field_dokument_file`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const doc = data.data;
  const included = data.included || [];

console.log(JSON.stringify(data, null, 2));

  const files = included
    .filter((i: any) => i.type === "file--file")
    .map((file: any) => ({
      id: file.id,
      url: file.attributes?.uri?.url
        ? `${API_URL}${file.attributes.uri.url}`
        : null,
      mime: file.attributes?.filemime ?? null,
    }));

  return {
    id: doc.id,
    title: doc.attributes.title,
    date: doc.attributes.created,
    status: doc.attributes.status?.value ?? null,
    files,
  };
}

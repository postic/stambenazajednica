import { getDrupalFileUrl } from "./getDrupalFileUrl";

const tipMap: Record<string, string> = {
  zapisnici: "f7a823b4-24e2-4edd-9ab1-e55e51f92d60",
  odluke: "1d3d870d-dddf-4c97-8c91-40fc1ce86409",
  ponude: "223a5875-daf1-4e9e-b0a3-d188b3b62497",
  ugovori: "abc5ec34-1035-4fdb-90ec-0cfa16d85953",
  "finansijski-izvestaji": "1a56e6bf-c626-4e92-88d5-88b1ef5908b5",
  ostalo: "321d6751-e379-456c-93b0-ca353e40a655",
};

export async function getDokumenti(tip: string) {
  const uuid = tipMap[tip];

  if (!uuid) {
    console.warn("Nepoznat tip dokumenta:", tip);
    return [];
  }

  const url =
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/dokument` +
    `?filter[field_tip_dokumenta.id]=${uuid}` +
    `&include=field_dokument_file`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error("Greška pri fetch-u dokumenata:", res.status);
    return [];
  }

  const json = await res.json();

  const files = Array.isArray(json.included) ? json.included : [];

  return (json.data || []).map((doc: any) => {
    const fileRefs = doc?.relationships?.field_dokument_file?.data || [];

    const dokumenti = fileRefs
      .map((ref: any) =>
        files.find((f: any) => f.id === ref.id)
      )
      .filter((file: any) => file && file.attributes)
      .map((file: any) => ({
        id: file.id,
        url: getDrupalFileUrl(file),
        mime: file.attributes.filemime,
      }));

    return {
      id: doc.id,
      title: doc.attributes?.title || "",
      created: doc.attributes?.created || "",
      status: doc.attributes?.field_status_dokumenta || "active",
      files: dokumenti,
    };
  });
}

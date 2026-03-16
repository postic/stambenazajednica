import { getDrupalFileUrl } from "./getDrupalFileUrl";

const tipMap: Record<string, number> = {
  zapisnici: 16,
  odluke: 17,
  ponude: 18,
  ugovori: 19,
  "finansijski-izvestaji": 20,
  ostalo: 21,
};

export async function getDokumenti(tip: string) {

  const tid = tipMap[tip];

  const url =
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}` +
    `/jsonapi/node/dokument` +
    `?filter[field_tip_dokumenta.meta.drupal_internal__target_id]=${tid}` +
    `&include=field_dokument_file`;

  const res = await fetch(url, { cache: "no-store" });

  const json = await res.json();

  const files = json.included || [];

  return json.data.map((doc: any) => {

    const fileRefs = doc.relationships.field_dokument_file?.data || [];

    const dokumenti = fileRefs.map((ref: any) => {
      const file = files.find((f: any) => f.id === ref.id);

      return {
        id: file?.id,
        url: getDrupalFileUrl(file),
        mime: file?.attributes?.filemime,
      };
    });

    return {
      id: doc.id,
      title: doc.attributes.title,
      files: dokumenti,
    };
  });
}

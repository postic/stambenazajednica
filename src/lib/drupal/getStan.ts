interface Osoba {
  id: string;
  attributes: {
    title: string;
  };
}

export function parseStan(stanData: any) {
  const data = stanData.data;
  const included = stanData.included || [];

  // Vlasnik
  const vlasnikRel = data.relationships?.field_vlasnik?.data;
  const vlasnik = included.find((i: any) => i.type === vlasnikRel?.type && i.id === vlasnikRel?.id);

  // Stanari
  const stanariIds = data.relationships?.field_stanari?.data?.map((i: any) => i.id) || [];
  const stanari = included.filter((i: any) => stanariIds.includes(i.id));

  return {
    title: data.attributes.title,
    vlasnik: vlasnik ? vlasnik.attributes.title : null,
    stanari: stanari.map((s: any) => ({
      id: s.id,
      title: s.attributes.title,
      isVlasnik: s.id === vlasnik?.id
    }))
  };
}

/*export function getVlasnikTitle(stanData: any): string | null {
  // provera da li data postoji
  if (!stanData || !stanData.data) return null;

  // provera da li relationships i field_vlasnik postoje
  const vlasnikRel = stanData.data.relationships?.field_vlasnik?.data;
  if (!vlasnikRel) return '-';//null;

  // included array mora postojati
  const included = stanData.included || [];
  const vlasnikNode = included.find(
    (item: any) => item.type === vlasnikRel.type && item.id === vlasnikRel.id
  );

  return vlasnikNode?.attributes?.title || null;
}
*/

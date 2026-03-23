export function getVlasnikTitle(stanData: any): string | null {
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

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

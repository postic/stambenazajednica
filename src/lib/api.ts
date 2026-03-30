// lib/api.ts
import { Anketa, Opcija } from "@/types/anketa";

// Fetch anketa sa opcijama
export async function fetchAnketa(id: string): Promise<Anketa> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_URL}/jsonapi/node/anketa/${id}?include=field_opcije`
  );
  const json = await res.json();
  return mapAnketaFromDrupal(json);
}

// Mapper Drupal JSON:API -> Anketa
export function mapAnketaFromDrupal(data: any): Anketa {
  const node = data.data;
  const included = data.included || [];

  const options: Opcija[] = included
    .filter((item: any) => item.type === "node--opcija")
    .map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      anketaId: node.id,
      order: item.attributes.field_redosled || 0,
      color: item.attributes.field_boja,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return {
    id: node.id,
    title: node.attributes.title,
    body: node.attributes.body?.value,
    created: node.attributes.created,
    status: node.attributes.status,
    options,
  };
}

// Fetch glasove za anketu
export async function fetchRezultati(anketaId: string): Promise<Record<string, number>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_URL}/jsonapi/node/glas?filter[field_anketa.id]=${anketaId}`
  );
  const json = await res.json();

  const counts: Record<string, number> = {};
  json.data.forEach((glas: any) => {
    const opcijaId = glas.relationships.field_opcija.data.id;
    counts[opcijaId] = (counts[opcijaId] || 0) + 1;
  });

  return counts;
}

// Pošalji glas
export async function submitGlas(anketaId: string, opcijaId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_DRUPAL_URL}/api/glasaj`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ anketaId, opcijaId }),
  });
}

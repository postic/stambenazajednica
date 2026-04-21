// src/lib/api.ts

// --------------------
// TYPES
// --------------------

export type DrupalItem = {
  id: string;
  attributes: {
    title?: string;
    field_redosled?: number;
    field_boja?: string;
  };
};

export type MappedItem = {
  id: string;
  title?: string;
  order?: number;
  color?: string;
};

export type ApiResponse<T> = {
  data: T[];
};

// --------------------
// BASIC NODES
// --------------------

export async function fetchNodes(): Promise<MappedItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/stan`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Greška pri učitavanju stanova");
  }

  const json: ApiResponse<DrupalItem> = await res.json();

  return json.data
    .map((item): MappedItem => ({
      id: item.id,
      title: item.attributes.title,
      order: item.attributes.field_redosled,
      color: item.attributes.field_boja,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// --------------------
// ANKETA
// --------------------

export type DrupalAnketa = {
  id: string;
  attributes: {
    title?: string;
    body?: {
      value: string;
    };
  };
};

export type AnketaResponse = {
  data: DrupalAnketa;
};

export async function fetchAnketa(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URLs}/jsonapi/node/anketa/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Anketa nije pronađena");
  }

  const json: AnketaResponse = await res.json();

  return {
    id: json.data.id,
    title: json.data.attributes.title,
    body: json.data.attributes.body?.value,
  };
}

// --------------------
// REZULTATI
// --------------------

export type DrupalRezultat = {
  id: string;
  attributes: {
    title?: string;
    field_votes?: number;
  };
};

export async function fetchRezultati(anketaId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/odgovor?filter[field_anketa.id]=${anketaId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Greška pri učitavanju rezultata");
  }

  const json: ApiResponse<DrupalRezultat> = await res.json();

  return json.data.map((item) => ({
    id: item.id,
    title: item.attributes.title,
    votes: item.attributes.field_votes ?? 0,
  }));
}

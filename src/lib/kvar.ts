// src/lib/kvar.ts
export interface Kvar {
  id: string;
  title: string;
  description: string;
}

// Fetch kvar po id iz Drupal JSON:API
export async function getKvar(id: string): Promise<Kvar | null> {
  if (!id) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar/${id}`, {
    cache: "no-store", // uvek svež fetch
  });

  if (!res.ok) return null;

  const data = await res.json();

  //console.log('LOG', data.data.attributes.body.value);

  // JSON:API format: data.attributes
  return {
    id: data.data.id,
    title: data.data.attributes.title,
    description: data.data.attributes.body.value || "",
  };
}

// Update kvar preko Drupal JSON:API (PUT ili PATCH)
export async function updateKvar(kvar: Kvar): Promise<boolean> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar/${kvar.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/vnd.api+json",
      "Accept": "application/vnd.api+json",
      // Ovde ide Authorization header ako je Drupal protected
      // "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        type: "node--kvar",
        id: kvar.id,
        attributes: {
          title: kvar.title,
          body: { value: kvar.description, format: "plain_text" },
        },
      },
    }),
  });

  return res.ok;
}

export interface Kvar {
  id: string;
  title: string;
  description: string;
  status?: string;
  priority?: string;
}

// 🔹 Fetch jednog kvara
export async function getKvar(id: string): Promise<Kvar | null> {
  if (!id) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const json = await res.json();

  return {
    id: json.data.id,
    title: json.data.attributes.title,
    description: json.data.attributes.body?.value || "",
    status: json.data.attributes.field_status_kvara || "",
    priority: json.data.attributes.field_prioritet_kvara || "",
  };
}

export async function getFieldOptions(fieldName: "field_status_kvara" | "field_prioritet_kvara") {
  try {

    const username = process.env.DRUPAL_USER!;
    const password = process.env.DRUPAL_PASS!;
    const auth = "Basic " + btoa(`${username}:${password}`);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar?fields[node--kvar]=${fieldName}`,
      {
        cache: "no-store",
        headers: {
          "Authorization": auth,
          "Accept": "application/vnd.api+json",
        },
      }
    );

    if (!res.ok) return [];

    const json = await res.json();

    // Pronađi prvi node koji sadrži meta.drupal_internal__options
    const itemWithOptions = json.data.find(
      (item: any) =>
        item.attributes?.[fieldName]?.meta?.drupal_internal__options
    );

    const opts = itemWithOptions?.attributes?.[fieldName]?.meta?.drupal_internal__options;

    if (!opts) return [];

    // Vrati niz { value, label } koji može direktno u <select>
    return Object.entries(opts).map(([value, label]) => ({
      value,
      label: String(label),
    }));
  } catch (err) {
    console.error("Error fetching field options:", err);
    return [];
  }
}

export async function updateKvar(kvar: Kvar): Promise<boolean> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar/${kvar.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/vnd.api+json",
        "Accept": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "node--kvar",
          id: kvar.id,
          attributes: {
            title: kvar.title,
            body: {
              value: kvar.description,
              format: "plain_text",
            },
            field_status: kvar.status,
            field_priority: kvar.priority,
          },
        },
      }),
    }
  );

  return res.ok;
}

const username = process.env.DRUPAL_USER!;
const password = process.env.DRUPAL_PASS!;
const auth = "Basic " + btoa(`${username}:${password}`);

export async function createKvar(data: { title: string; body: string; status?: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      "Accept": "application/vnd.api+json",
      "Authorization": auth,
    },
    body: JSON.stringify({
      data: {
        type: "node--kvar",
        attributes: data,
      },
    }),
  });

  alert(data);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.errors?.[0]?.detail || "Failed to create kvar");
  }

  return res.json();
}

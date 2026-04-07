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
    status: json.data.attributes.field_status || "",
    priority: json.data.attributes.field_priority || "",
  };
}

// 🔹 Fetch options iz Drupala (status / priority)
export async function getFieldOptions(fieldName: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar?fields[node--kvar]=${fieldName}`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const json = await res.json();

  const itemWithOptions = json.data.find(
    (item: any) =>
      item.attributes?.[fieldName]?.meta?.drupal_internal__options
  );

  const opts =
    itemWithOptions?.attributes?.[fieldName]?.meta
      ?.drupal_internal__options;

  if (!opts) return [];

  return Object.entries(opts).map(([value, label]) => ({
    value,
    label: String(label),
  }));
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

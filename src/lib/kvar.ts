import type { Kvar } from "@/types/kvar";

// 🔐 AUTH helper (radi server-side)
function getAuthHeader() {
  const username = process.env.DRUPAL_USER!;
  const password = process.env.DRUPAL_PASS!;
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

// ===============================
// 🔹 GET ONE
// ===============================
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
    description: json.data.attributes.body?.value ?? "",
    status: json.data.attributes.field_status_kvara ?? undefined,
    priority: json.data.attributes.field_prioritet_kvara ?? undefined,
  };
}

// ===============================
// 🔹 FIELD OPTIONS
// ===============================
export async function getFieldOptions(
  fieldName: "field_status_kvara" | "field_prioritet_kvara"
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar?fields[node--kvar]=${fieldName}`,
      {
        cache: "no-store",
        headers: {
          Authorization: getAuthHeader(),
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!res.ok) return [];

    const json = await res.json();

    const item = json.data.find(
      (i: any) =>
        i.attributes?.[fieldName]?.meta?.drupal_internal__options
    );

    const opts =
      item?.attributes?.[fieldName]?.meta?.drupal_internal__options;

    if (!opts) return [];

    return Object.entries(opts).map(([value, label]) => ({
      value,
      label: String(label),
    }));
  } catch (err) {
    console.error("Error fetching field options:", err);
    return [];
  }
}

// ===============================
// 🔹 UPDATE
// ===============================
export async function updateKvar(kvar: Kvar): Promise<boolean> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar/${kvar.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        Authorization: getAuthHeader(),
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
            field_status_kvara: kvar.status ?? null,
            field_prioritet_kvara: kvar.priority ?? null,
          },
        },
      }),
    }
  );

  return res.ok;
}

// ===============================
// 🔹 CREATE
// ===============================
export async function createKvar(data: {
  title: string;
  description: string;
  status?: string;
  priority?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          type: "node--kvar",
          attributes: {
            title: data.title,
            body: {
              value: data.description,
              format: "plain_text",
            },
            field_status_kvara: data.status ?? null,
            field_prioritet_kvara: data.priority ?? null,
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Drupal error:", text);
    throw new Error("Failed to create kvar");
  }

  return res.json();
}

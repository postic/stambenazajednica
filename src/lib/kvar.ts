import type { Kvar } from "@/types/kvar";
import { getAuthHeader } from "@/lib/auth";

// ===============================
// 🔹 DRUPAL RESPONSE
// ===============================
type DrupalKvarResponse = {
  data: {
    id: string;
    attributes: {
      title?: string;
      body?: {
        value?: string;
      };
      field_status_kvara?: string;
      field_prioritet_kvara?: string;
      created?: string;
    };
  };
};

// ===============================
// 🔹 FETCH SINGLE
// ===============================
export async function fetchKvar(id: string): Promise<Kvar> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar/${id}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.api+json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Greška pri učitavanju kvara");
  }

  const json: DrupalKvarResponse = await res.json();
  const data = json.data;

  return {
    id: data.id,
    title: data.attributes.title ?? "",
    description: data.attributes.body?.value ?? "",
    status: data.attributes.field_status_kvara ?? "unknown",
    priority: data.attributes.field_prioritet_kvara ?? "normal",

    body: data.attributes.body?.value ?? "",
    created: data.attributes.created ?? "",
  };
}

// 🔥 ALIAS (fix za stare import-e)
export const getKvar = fetchKvar;

// ===============================
// 🔹 FIELD OPTIONS
// ===============================
export async function getFieldOptions(
  fieldName: "field_status_kvara" | "field_prioritet_kvara"
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar`,
      {
        cache: "no-store",
        headers: {
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
            field_status_kvara: kvar.status,
            field_prioritet_kvara: kvar.priority,
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

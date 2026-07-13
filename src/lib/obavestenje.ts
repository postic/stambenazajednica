import type { Obavestenje } from "@/types/obavestenje";
import { getAuthHeader } from "@/lib/auth";

// ===============================
// 🔹 DRUPAL RESPONSE
// ===============================
type DrupalObavestenjeResponse = {
  data: {
    id: string;
    attributes: {
      title?: string;
      body?: {
        value?: string;
      };
      created?: string;
    };
  };
};

// ===============================
// 🔹 FETCH SINGLE
// ===============================
export async function fetchObavestenje(id: string): Promise<Kvar> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${id}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.api+json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Greška pri učitavanju obavestenja");
  }

  const json: DrupalObavestenjeResponse = await res.json();
  const data = json.data;

  return {
    id: data.id,
    title: data.attributes.title ?? "",
    description: data.attributes.body?.value ?? "",
    body: data.attributes.body?.value ?? "",
    created: data.attributes.created ?? "",
  };
}

// 🔥 ALIAS (fix za stare import-e)
export const getObavestenje = fetchObavestenje;

// ===============================
// 🔹 FIELD OPTIONS
// ===============================
export async function getFieldOptions(
  fieldName: "field_status_kvara" | "field_prioritet_kvara"
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/oavestenje`,
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
export async function updateObavestenje(obavestenje: Obavestenje): Promise<boolean> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/obavestenje/${obavestenje.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          type: "node--obavestenje",
          id: kvar.id,
          attributes: {
            title: obavestenje.title,
            body: {
              value: obavestenje.description,
              format: "plain_text",
            },
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
export async function createObavestenje(data: {
  title: string;
  description: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/obavestenje`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          type: "node--obavestenje",
          attributes: {
            title: data.title,
            body: {
              value: data.description,
              format: "plain_text",
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Drupal error:", text);
    throw new Error("Failed to create obavestenje");
  }

  return res.json();
}

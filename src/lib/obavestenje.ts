import type { Obavestenje } from "@/types/obavestenje";

// ==================================================
// API RESPONSE
// ==================================================

type ApiResponse = {
  data?: any;
  error?: string;
  details?: any;
};

// ==================================================
// Helper
// ==================================================

async function parseResponse(
  response: Response
): Promise<ApiResponse> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: text,
    };
  }
}

// ==================================================
// FETCH SINGLE
// ==================================================

export async function fetchObavestenje(
  id: string
): Promise<Obavestenje> {
  const res = await fetch(
    `/api/obavestenja?id=${encodeURIComponent(id)}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const json =
    await parseResponse(res);

  if (!res.ok) {
    console.error(
      "Greška pri učitavanju obaveštenja:",
      json
    );

    throw new Error(
      json.error ||
        "Greška pri učitavanju obaveštenja"
    );
  }

  const data = json.data;

  if (!data) {
    throw new Error(
      "Obaveštenje nije pronađeno"
    );
  }

  return {
    id: data.id,

    title:
      data.attributes?.title ??
      "",

    body:
      data.attributes?.body?.value ??
      "",

    created:
      data.attributes?.created ??
      "",
  };
}

// ==================================================
// ALIAS
// ==================================================

export const getObavestenje =
  fetchObavestenje;

// ==================================================
// FETCH ALL
// ==================================================

export async function fetchObavestenja(): Promise<
  Obavestenje[]
> {
  const res = await fetch(
    "/api/obavestenja",
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const json =
    await parseResponse(res);

  if (!res.ok) {
    console.error(
      "Greška pri učitavanju obaveštenja:",
      json
    );

    throw new Error(
      json.error ||
        "Greška pri učitavanju obaveštenja"
    );
  }

  const items =
    Array.isArray(json.data)
      ? json.data
      : [];

  return items.map(
    (item: any) => ({
      id: item.id,

      title:
        item.attributes?.title ??
        "",

      body:
        item.attributes?.body?.value ??
        "",

      created:
        item.attributes?.created ??
        "",
    })
  );
}

// ==================================================
// ALIAS
// ==================================================

export const getObavestenja =
  fetchObavestenja;

// ==================================================
// FIELD OPTIONS
// ==================================================

export async function getFieldOptions(
  fieldName:
    | "field_status_kvara"
    | "field_prioritet_kvara"
) {
  console.warn(
    "getFieldOptions nije implementiran preko /api/obavestenja:",
    fieldName
  );

  return [];
}

// ==================================================
// CREATE
// ==================================================

export async function createObavestenje(
  data: {
    title: string;
    body: string;
  }
): Promise<Obavestenje> {
  const res = await fetch(
    "/api/obavestenja",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Accept:
          "application/json",
      },

      body: JSON.stringify({
        title: data.title,
        body: data.body,
      }),

      cache: "no-store",
    }
  );

  const json =
    await parseResponse(res);

  if (!res.ok) {
    console.error(
      "Greška pri kreiranju obaveštenja:",
      json
    );

    throw new Error(
      json.error ||
        "Greška pri kreiranju obaveštenja"
    );
  }

  const item =
    json.data;

  if (!item) {
    throw new Error(
      "Kreirano obaveštenje nije vraćeno"
    );
  }

  return {
    id: item.id,

    title:
      item.attributes?.title ??
      data.title,

    body:
      item.attributes?.body?.value ??
      data.body,

    created:
      item.attributes?.created ??
      "",
  };
}

// ==================================================
// UPDATE
// ==================================================

export async function updateObavestenje(
  obavestenje: Obavestenje
): Promise<Obavestenje> {
  const res = await fetch(
    "/api/obavestenja",
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",

        Accept:
          "application/json",
      },

      body: JSON.stringify({
        id:
          obavestenje.id,

        title:
          obavestenje.title,

        body:
          obavestenje.body,
      }),

      cache: "no-store",
    }
  );

  const json =
    await parseResponse(res);

  if (!res.ok) {
    console.error(
      "Greška pri izmeni obaveštenja:",
      json
    );

    throw new Error(
      json.error ||
        "Greška pri izmeni obaveštenja"
    );
  }

  const item =
    json.data;

  if (!item) {
    return obavestenje;
  }

  return {
    id: item.id,

    title:
      item.attributes?.title ??
      obavestenje.title,

    body:
      item.attributes?.body?.value ??
      obavestenje.body,

    created:
      item.attributes?.created ??
      obavestenje.created ??
      "",
  };
}

// ==================================================
// DELETE
// ==================================================

export async function deleteObavestenje(
  id: string
): Promise<void> {
  const res = await fetch(
    `/api/obavestenja?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",

      headers: {
        Accept: "application/json",
      },

      cache: "no-store",
    }
  );

  const json =
    await parseResponse(res);

  if (!res.ok) {
    console.error(
      "Greška pri brisanju obaveštenja:",
      json
    );

    throw new Error(
      json.error ||
        "Greška pri brisanju obaveštenja"
    );
  }
}

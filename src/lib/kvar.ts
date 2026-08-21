import type { Kvar } from "@/types/kvar";

// ==================================================
// API RESPONSE
// ==================================================

type ApiResponse = {
  data?: any;
  error?: string;
  details?: any;

  total?: number;
  page?: number;
  totalPages?: number;
};

// ==================================================
// HELPER
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

export async function fetchKvar(
  id: string
): Promise<Kvar> {
  const res = await fetch(
    `/api/kvarovi?id=${encodeURIComponent(id)}`,
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
      "Greška pri učitavanju kvara:",
      json
    );

    throw new Error(
      json.error ||
        "Greška pri učitavanju kvara"
    );
  }

  const data =
    json.data;

  if (!data) {
    throw new Error(
      "Kvar nije pronađen"
    );
  }

  return {
    id:
      data.id,

    title:
      data.attributes?.title ??
      "",

    description:
      data.attributes?.body?.value ??
      "",

    status:
      data.attributes
        ?.field_status_kvara ??
      "unknown",

    prioritet:
      data.attributes
        ?.field_prioritet_kvara ??
      "normal",

    body:
      data.attributes?.body?.value ??
      "",

    created:
      data.attributes?.created ??
      "",

    image:
      data.attributes?.image ??
      null,
  };
}

// ==================================================
// ALIAS
// ==================================================

export const getKvar =
  fetchKvar;

// ==================================================
// FETCH ALL
// ==================================================

export async function fetchKvarovi(
  page = 1,
  limit = 10
): Promise<{
  data: Kvar[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const res = await fetch(
    `/api/kvarovi?page=${page}&limit=${limit}`,
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
      "Greška pri učitavanju kvarova:",
      json
    );

    throw new Error(
      json.error ||
        "Greška pri učitavanju kvarova"
    );
  }

  return {
    data:
      Array.isArray(json.data)
        ? json.data
        : [],

    total:
      json.total ?? 0,

    page:
      json.page ?? page,

    totalPages:
      json.totalPages ?? 0,
  };
}

// ==================================================
// ALIAS
// ==================================================

export const getKvarovi =
  fetchKvarovi;

// ==================================================
// FIELD OPTIONS
// ==================================================

export async function getFieldOptions(
  fieldName:
    | "field_status_kvara"
    | "field_prioritet_kvara"
) {
  /*
   * Ova funkcija je ostavljena
   * zbog kompatibilnosti sa
   * postojećim kodom.
   *
   * Trenutno forma koristi
   * direktno definisane opcije.
   */

  console.warn(
    "getFieldOptions:",
    fieldName
  );

  return [];
}

// ==================================================
// CREATE
// ==================================================

export async function createKvar(
  data: {
    title: string;
    description: string;
    status?: string;
    prioritet?: string;
  }
): Promise<Kvar> {
  const res = await fetch(
    "/api/kvarovi",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Accept:
          "application/json",
      },

      body: JSON.stringify({
        title:
          data.title,

        description:
          data.description,

        status:
          data.status ?? "",

        prioritet:
          data.prioritet ?? "",
      }),

      cache: "no-store",
    }
  );

  const json =
    await parseResponse(res);

  if (!res.ok) {
    console.error(
      "Greška pri kreiranju kvara:",
      json
    );

    throw new Error(
      json.error ||
        "Greška pri kreiranju kvara"
    );
  }

  const item =
    json.data;

  if (!item) {
    throw new Error(
      "Kreirani kvar nije vraćen"
    );
  }

  return {
    id:
      item.id,

    title:
      item.attributes?.title ??
      data.title,

    description:
      item.attributes?.body?.value ??
      data.description,

    body:
      item.attributes?.body?.value ??
      data.description,

    status:
      item.attributes
        ?.field_status_kvara ??
      data.status ??
      "",

    prioritet:
      item.attributes
        ?.field_prioritet_kvara ??
      data.prioritet ??
      "",

    created:
      item.attributes?.created ??
      "",
  };
}

// ==================================================
// UPDATE
// ==================================================

export async function updateKvar(
  kvar: Kvar
): Promise<boolean> {
  const res = await fetch(
    `/api/kvarovi`,
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
          kvar.id,

        title:
          kvar.title,

        description:
          kvar.description,

        status:
          kvar.status,

        prioritet:
          kvar.prioritet,
      }),

      cache: "no-store",
    }
  );

  const json =
    await parseResponse(res);

  if (!res.ok) {
    console.error(
      "Greška pri izmeni kvara:",
      json
    );

    return false;
  }

  return true;
}

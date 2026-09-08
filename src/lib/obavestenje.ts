const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

type CreateObavestenjeData = {
  title: string;
  description: string;
  kategorija: string;
};

// ==================================================
// CREATE
// ==================================================

export async function createObavestenje({
  title,
  description,
  kategorija,
}: CreateObavestenjeData) {
  const response = await fetch("/api/obavestenja", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      kategorija,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Greška prilikom kreiranja obaveštenja"
    );
  }

  return data;
}

// ==================================================
// DELETE
// ==================================================

export async function deleteObavestenje(
  slug: string,
  id: string
) {
  if (!slug || !id) {
    throw new Error("Slug i ID obaveštenja su obavezni");
  }

  const response = await fetch(
    `/api/obavestenja/${slug}/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Greška prilikom brisanja obaveštenja"
    );
  }

  return data;
}

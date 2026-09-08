const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

type CreateObavestenjeData = {
  title: string;
  description: string;
  kategorija: string;
};

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

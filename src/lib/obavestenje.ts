const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

type CreateObavestenjeData = {
  title: string;
  description: string;
  kategorija: string;
  image?: File | null;
};

export async function createObavestenje({
  title,
  description,
  kategorija,
  image,
}: CreateObavestenjeData) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("kategorija", kategorija);

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch("/api/obavestenja", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Greška prilikom kreiranja obaveštenja"
    );
  }

  return data;
}

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

export type UpdateKvarInput = {
  title?: string;
  body?: string;
  status?: string;
};

export async function updateKvar(
  id: string,
  data: UpdateKvarInput
) {
  const res = await fetch(`/api/kvarovi/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.status !== undefined && { status: data.status }),
    }),
  });

  if (!res.ok) {
    let message = "Greška pri izmeni kvara";

    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {}

    throw new Error(message);
  }

  return res.json();
}

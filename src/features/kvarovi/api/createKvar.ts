export type CreateKvarInput = {
  title: string;
  body?: string;
  status?: string;
};

export async function createKvar(data: CreateKvarInput) {
  const res = await fetch("/api/kvarovi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.title,
      body: data.body || "",
      status: data.status || "novo",
    }),
  });

  if (!res.ok) {
    let message = "Greška pri kreiranju kvara";

    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {}

    throw new Error(message);
  }

  return res.json();
}

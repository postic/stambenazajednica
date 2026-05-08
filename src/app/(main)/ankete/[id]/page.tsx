import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { isEmptyHtml } from "@/lib/text";
import VotingClient from "./VotingClient";

// ---------------- ANKETA ----------------
async function getAnketa(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/anketa/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const json = await res.json();
  const item = json.data;

  if (!item) return null;

  return {
    id: item.id,
    title: item.attributes.title,
    created: item.attributes.created,
    body: item.attributes.body?.value || "",
    pitanje: item.attributes.field_anketa_pitanje,
    status: item.attributes.field_status_ankete,
  };
}

// ---------------- OPCIJE ----------------
async function getOpcije(anketaId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/opcija?filter[field_opcija_anketa.id]=${anketaId}`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const json = await res.json();

  return json.data.map((o: any) => ({
    id: o.id,
    label: o.attributes.title,
    votes: o.attributes.field_opcija_broj_glasova || 0,
  }));
}

// ---------------- PAGE ----------------
export default async function AnketeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const anketa = await getAnketa(id);
  if (!anketa) notFound();

  const opcije = await getOpcije(id);

  return (
    <div className="max-w-4xl">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div data-field>
            <h1 className="text-xl font-semibold">
              {anketa.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {new Date(anketa.created).toLocaleDateString("sr-Latn-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {anketa.status && <StatusBadge status={anketa.status} />}
          </div>
        </div>
      </div>

      <div className="mt-3 mb-3 border p-3 bg-slate-50">
        {anketa.pitanje}
      </div>

      {!isEmptyHtml(anketa.body) && (
        <div
          className="mt-3 border p-3 bg-slate-50"
          dangerouslySetInnerHTML={{ __html: anketa.body }}
        />
      )}

      {/* 🔥 CLIENT PART */}
      <VotingClient anketaId={anketa.id} opcije={opcije} />

    </div>
  );
}

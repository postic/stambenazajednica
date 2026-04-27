import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";

import AnketeVotingForm from "./AnketeVotingForm";
import AnketeResults from "./AnketeResults";

// ---------------- FETCH ANKETA ----------------
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

// ---------------- USER VOTE ----------------
async function getUserVoteForCurrentUser(anketaId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/glas?filter[field_glas_anketa.id]=${anketaId}`,
      { credentials: "include" }
    );

    if (!res.ok) return null;

    const data = await res.json();

    if (data?.data?.length > 0) {
      return data.data;
    }
  } catch {
    return null;
  }

  return null;
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
  const userVote = await getUserVoteForCurrentUser(id);

  return (
    <div className="max-w-4xl text-gray-800">

      {/* BACK */}
      <div className="mb-4">
        <BackButton />
      </div>

      {/* HEADER (KVAR STYLE) */}
      <div className="mb-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-xl font-semibold">
              {anketa.title}
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(anketa.created).toLocaleDateString("sr-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div>
            {anketa.status && (
              <StatusBadge status={anketa.status} />
            )}
          </div>

        </div>

        <div className="mt-3 border-b border-gray-200"></div>
      </div>

      {/* QUESTION BLOCK (SYSTEM PANEL) */}
      <div className="border border-gray-300 bg-slate-50 p-4 mb-5">
        <h2 className="text-sm font-semibold text-slate-800">
          {anketa.pitanje}
        </h2>
      </div>

      {/* VOTING BLOCK (CORE SYSTEM BOX) */}
      <div className="border border-gray-300 bg-white p-4 mb-6">

        {userVote ? (
          <AnketeResults opcije={opcije} userVote={userVote} />
        ) : (
          <AnketeVotingForm anketaId={anketa.id} opcije={opcije} />
        )}

      </div>

      {/* DESCRIPTION */}
      {!isEmptyHtml(anketa.body) && (
        <div className="border border-gray-300 bg-white p-4">
          <div
            className="text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: anketa.body }}
          />
        </div>
      )}

    </div>
  );
}

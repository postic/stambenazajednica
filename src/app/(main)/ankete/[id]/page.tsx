import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";

import AnketeVotingForm from "./AnketeVotingForm";
import AnketeResults from "./AnketeResults";

async function getAnketa(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/anketa/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Greška pri učitavanju ankete");

  const json = await res.json();


  return {
    id: json.data.id,
    title: json.data.attributes.title,
    created: json.data.attributes.created,
    body: json.data.attributes.body?.value || "",
    pitanje: json.data.attributes.field_anketa_pitanje,
    status: json.data.attributes.field_status_ankete,
  };
}

async function getOpcije(anketaId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/opcija?filter[field_opcija_anketa.id]=${anketaId}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Greška pri učitavanju opcija");

  const json = await res.json();

  return json.data.map((o: any) => ({
    id: o.id,
    label: o.attributes.title,
    votes: o.attributes.field_opcija_broj_glasova || 0,
  }));
}

async function getUserVoteForCurrentUser(anketaId?: string): Promise<string | null> {

  if (!anketaId) return null;

  try {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/glas?filter[field_glas_anketa.id]=${anketaId}`,
    { credentials: "include" }
  );

  if (!res.ok) return null;

    const data = await res.json();
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      // Vraća value prvog glasa, prilagodi ime polja po Drupal-u
      return data.data;
    }
  } catch (err) {
    //console.error("Greška pri dohvatanju glasova za korisnika:", err);
    return null;
  }
}


export default async function AnketeDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const anketa = await getAnketa(id);
  const opcije = await getOpcije(id);
  const userVote = await getUserVoteForCurrentUser(id);

  return (
    <div className="max-w-4xl">
      {/* 🔙 BACK BUTTON */}
      <BackButton />
      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {anketa.title}
        {anketa.status && <StatusBadge status={anketa.status} />}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(anketa.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

    <div className="prose max-w-none bg-white p-5 mb-6 rounded-2xl border">
      <h1 className="text-base md:text-lg font-medium text-slate-900 mb-4">
        {anketa.pitanje}
      </h1>

      <div>
        {userVote ? (
        <AnketeResults opcije={opcije} userVote={userVote} />
        ) : (
        <AnketeVotingForm anketaId={anketa.id} opcije={opcije} />
        )}
      </div>
    </div>

    {/* 📄 OPIS */}
      {!isEmptyHtml(anketa.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border"
          dangerouslySetInnerHTML={{ __html: anketa.body }}
        />
      )}

    </div>
  );
}

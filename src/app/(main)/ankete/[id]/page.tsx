import { Anketa, Opcija } from "@/features/ankete/types";
import { isEmptyHtml } from "@/lib/text";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function AnketeDetailPage({ params }: Props) {
  const { id } = await params;

  let anketa: Anketa | null = null;
  let errorMessage: string | null = null;

  try {
    // 1️⃣ Fetch ankete po ID-u
    const anketaRes = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/anketa/${id}`,
      { cache: "no-store" }
    );

    if (!anketaRes.ok) {
      errorMessage = `Drupal returned status ${anketaRes.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const anketaJson = await anketaRes.json();

    anketa = {
      id: anketaJson.data.id,
      title: anketaJson.data.attributes.field_anketa_pitanje || "Bez pitanja",
      body: anketaJson.data.attributes.body?.value || "",
      created: anketaJson.data.attributes.created || new Date().toISOString(),
      status: anketaJson.data.attributes.field_status_ankete || undefined,
      options: [], // inicijalno prazno, popuniće se posle
    };

    // 2️⃣ Fetch opcija koje referenciraju ovu anketu
    const optionsRes = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/opcija?filter[field_opcija_anketa.id]=${id}`,
      { cache: "no-store" }
    );

    if (!optionsRes.ok) {
      console.warn(
        `Opcije za anketu nisu dohvaćene, status ${optionsRes.status}`
      );
    } else {
      const optionsJson = await optionsRes.json();

      const options: Opcija[] = (optionsJson.data || []).map((opt: any, index: number) => ({
        id: opt.id,
        title: opt.attributes.title || "Bez naslova",
        anketaId: id,
        order: opt.attributes.field_redosled ?? index,
        votes: 0,
      }));

      anketa.options = options;
    }
  } catch (err) {
    console.error("Greška pri učitavanju ankete ili opcija:", err);
    errorMessage = errorMessage || "Ne mogu da učitam anketu sa servera.";
  }

  if (!anketa) {
    return (
      <div className="max-w-lg mx-auto p-4 text-red-600 font-semibold">
        {errorMessage || "Anketa nije pronađena."}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

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

      {/* 📄 OPIS */}
      {!isEmptyHtml(anketa.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border"
          dangerouslySetInnerHTML={{ __html: anketa.body }}
        />
      )}

      {anketa.options.length > 0 ? (

        <div
          className="prose max-w-none bg-white p-5 mt-4 rounded-2xl border">
        <ul className="space-y-2">
          {anketa.options.map((opt) => (
            <li
              key={opt.id}
              className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
            >
              {opt.title}
            </li>
          ))}
        </ul>
        </div>
      ) : (
        <p className="text-gray-500">Opcije ankete trenutno nisu dostupne.</p>
      )}
    </div>
  );
}

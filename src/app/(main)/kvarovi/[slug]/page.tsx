import { notFound } from "next/navigation";

interface Kvar {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string | null;
}

const DRUPAL_BASE_URL =
  process.env.DRUPAL_BASE_URL || "http://localhost:8888";

async function getKvar(slugOrId: string): Promise<Kvar | null> {
  try {
    // Pokušaj prvo po slug (SEO-friendly)
    let res = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/kvar?filter[path.alias]=/obavestenja/${slugOrId}&include=field_image`,
      { headers: { Accept: "application/vnd.api+json" }, cache: "no-store" }
    );

    let data = await res.json();
    let item = data.data?.[0];

    // fallback na ID
    if (!item) {
      res = await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/kvar/${slugOrId}?include=field_image`,
        { headers: { Accept: "application/vnd.api+json" }, cache: "no-store" }
      );
      data = await res.json();
      item = data.data;
      if (!item) return null;
    }

    const imageId = item.relationships?.field_image?.data?.id;
    const imageIncluded = data.included?.find((inc: any) => inc.id === imageId);

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      image: imageIncluded ? DRUPAL_BASE_URL + imageIncluded.attributes.uri.url : null,
    };
  } catch (err) {
    return null;
  }
}

export default async function KvarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const kvar = await getKvar(slug);

  if (!kvar) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-base uppercase tracking-wide font-semibold text-slate-700 mb-1">{kvar.title}</h1>

      <p className="text-gray-500 text-sm mb-4">
        {new Date(kvar.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {kvar.image && (
        <img src={kvar.image} alt={kvar.title} className="w-full rounded-xl mb-6" />
      )}

      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: kvar.body }} />
    </div>
  );
}

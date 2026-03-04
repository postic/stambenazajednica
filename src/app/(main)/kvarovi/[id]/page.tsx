import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";

interface Kvar {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
}

const DRUPAL_BASE_URL = process.env.DRUPAL_BASE_URL || "http://localhost:8888";

async function getKvar(id: string): Promise<Kvar | null> {
  try {
    const res = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/kvar/${id}?include=field_image`,
      {
        headers: { Accept: "application/vnd.api+json" },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("Fetch failed:", res.status);
      return null;
    }

    const data = await res.json();
    const item = data?.data;
    if (!item) return null;

const images = extractImages(data.data, data.included);
//console.error("Fotografije:", images);

    /*let imageUrl: string | null = null;
      const imageRel = item.relationships?.field_image?.data?.[0]; // array field
      if (imageRel && data.included) {
        const fileObj = data.included.find((i: any) => i.type === "file--file" && i.id === imageRel.id);
        const fileUriValue = fileObj?.attributes?.uri?.value; // ovo je public:// putanja
        if (fileUriValue) {
          // konvertujemo public:// u pravi URL
          const filePath = fileUriValue.replace("public://", "/sites/default/files/");
          imageUrl = `${process.env.DRUPAL_BASE_URL}${filePath}`;
        }
      }
*/
    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      image: images,
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KvarPage({ params }: PageProps) {
  const { id } = await params;

  const kvar = await getKvar(id);

  if (!kvar) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700">
        {kvar.title}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(kvar.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {kvar.image?.length ? (
  <div className="grid grid-cols-2 gap-2">
    {kvar.image.map((img, idx) => (
      <img key={idx} src={img} alt={`${kvar.title} - ${idx + 1}`} className="w-full h-32 object-cover rounded"/>
    ))}
  </div>
) : (
  <span>Nema slika</span>
)}

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: kvar.body }}
      />
    </div>
  );
}

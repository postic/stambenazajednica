import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";

interface Stan {
  id: string;
  title: string;
  body: string;
  created: string;
}

const DRUPAL_BASE_URL = process.env.DRUPAL_BASE_URL || "http://localhost:8888";

async function getStan(id: string): Promise<Stanar | null> {
  try {
    const res = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/stanovi/${id}`,
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

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
    };
  } catch (error) {
    console.error("Greška pri fetch-u:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StanPage({ params }: PageProps) {
  const { id } = await params;

  const stan = await getStan(id);

  if (!stan) notFound();

  return (
    <div className="max-w-4xl mx-auto">

      {/* 🔙 BACK BUTTON */}
      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {stan.title}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(stan.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: stan.body }}
      />
    </div>
  );
}

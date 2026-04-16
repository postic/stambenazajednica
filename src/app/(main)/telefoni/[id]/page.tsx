import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";
import type { Telefon } from "@/types/telefon";

const NEXT_PUBLIC_DRUPAL_BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

async function getTelefon(id: string): Promise<Telefon | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/telefon/${id}`,
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
      phone: item.attributes.phone?.value ?? "",
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

export default async function TelefonPage({ params }: PageProps) {
  const { id } = await params;

  const telefon = await getTelefon(id);

  if (!telefon) notFound();

  return (
    <div className="max-w-4xl">

      {/* 🔙 BACK BUTTON */}
      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {telefon.title}
      </h1>

    </div>
  );
}

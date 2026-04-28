import { notFound } from "next/navigation";
import { extractImages } from "@/lib/images";
import { isEmptyHtml } from "@/lib/text";
import ImageGridLightbox from "@/components/ImageGridLightbox";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";
import type { Telefon } from "@/types/telefon";
import { Phone } from "lucide-react";

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
      phone:
        item.attributes?.field_phone?.value ??
        item.attributes?.field_phone ??
        "",
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

      {/* BACK */}
      <div className="mb-4">
        <BackButton />
      </div>

      {/* TITLE */}
      <h1 className="text-xl font-semibold mb-1">
        {telefon.title}
      </h1>

      <p className="text-xs text-gray-500 mt-1">
        {new Date(telefon.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="flex items-center gap-2 py-4 mb-6">
  <Phone className="w-5 h-5 text-slate-700" />

  <span className="tabular-nums text-lg font-bold text-slate-900 tracking-wide">
    {telefon.phone}
  </span>
</div>

    </div>
  );
}

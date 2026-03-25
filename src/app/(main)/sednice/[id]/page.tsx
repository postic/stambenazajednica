// src/app/(main)/sednice/[id]/page.tsx
import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";
import { Sednica, Dokument } from "@/features/sednice/types";
import { getFileIcon } from "@/features/dokumenti/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888/web";

// 🔹 Mapiranje included entiteta
function indexIncluded(included: any[] = []) {
  const map = new Map();
  for (const item of included) {
    map.set(`${item.type}:${item.id}`, item);
  }
  return map;
}

// 🔹 Generisanje URL-a fajla
function getDrupalFileUrl(fileEntity: any) {
  if (!fileEntity) return "";

  const rawUrl = fileEntity.attributes?.uri?.url;
  const filename = fileEntity.attributes?.filename;
  const base = NEXT_PUBLIC_DRUPAL_BASE_URL.replace(/\/web$/, "");

  if (rawUrl) {
    const url = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
    return `${base}${url}`;
  }

  if (filename) {
    return `${base}/sites/default/files/${filename}`;
  }

  return "";
}

// 🔹 Fetch sednice
async function getSednica(id: string): Promise<Sednica | null> {
  try {
    const endpoint =
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/sednica/${id}` +
      `?include=field_dokumenti_sednice,field_dokumenti_sednice.field_dokument_file`;

    const res = await fetch(endpoint, {
      headers: { Accept: "application/vnd.api+json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    const item = data.data;
    if (!item) return null;

    const includedMap = indexIncluded(data.included);

    const dokumenti: Dokument[] = [];

    const dokumentiRelRaw =
      item.relationships?.field_dokumenti_sednice?.data;

    const dokumentiRel = Array.isArray(dokumentiRelRaw)
      ? dokumentiRelRaw
      : dokumentiRelRaw
      ? [dokumentiRelRaw]
      : [];

    for (const rel of dokumentiRel) {
      const media = includedMap.get(`${rel.type}:${rel.id}`);
      if (!media) continue;

      const fileRel = media.relationships?.field_dokument_file?.data;
      const files = Array.isArray(fileRel) ? fileRel : [fileRel];

      for (const f of files) {
        if (!f) continue;

        const fileEntity = includedMap.get(`${f.type}:${f.id}`);
        if (!fileEntity) continue;

        const fileUrl = getDrupalFileUrl(fileEntity);
        const fileMime = fileEntity.attributes?.filemime;

        dokumenti.push({
          id: f.id,
          title:
            media.attributes?.title ||
            media.attributes?.name ||
            "Dokument",
          url: fileUrl,
          mimeType: fileMime,
        });
      }
    }

    return {
      id: item.id,
      title: item.attributes.title,
      body: item.attributes.body?.value ?? "",
      created: item.attributes.created,
      status: item.attributes.field_status_sednice,
      dokumenti,
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// 🔥 PAGE
export default async function SednicaPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  const sednica = await getSednica(id);
  if (!sednica) notFound();

  const docs = sednica.dokumenti || [];
  const pdfDoc = docs.find((d) => d.mimeType?.includes("pdf"));

  return (
    <div className="max-w-4xl">
      <BackButton />

      {/* NASLOV */}
      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {sednica.title}
        {sednica.status && (
          <StatusBadge status={sednica.status} />
        )}
      </h1>

      {/* DATUM */}
      <p className="text-gray-500 text-sm mb-6">
        {new Date(sednica.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* OPIS */}
      {!isEmptyHtml(sednica.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border mb-6"
          dangerouslySetInnerHTML={{ __html: sednica.body }}
        />
      )}

      {/* 📎 DOKUMENTI */}
      {docs.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border space-y-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 border rounded-xl p-4 hover:bg-gray-50 transition"
            >
              <span className="text-xl">
                {getFileIcon(doc.mimeType)}
              </span>

              <div className="flex-1">
                <div className="font-medium">{doc.title}</div>
              </div>

              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Otvori
              </a>
            </div>
          ))}

          {/* 📄 PDF PREVIEW */}
          {pdfDoc && (
            <div className="mt-4 border rounded-xl overflow-hidden">
              <iframe
                src={pdfDoc.url}
                className="w-full h-[600px]"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

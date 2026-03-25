// src/app/(main)/sednice/[id]/page.tsx
import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt } from "react-icons/fa";
import { Sednica, Dokument } from "@/features/sednice/types";
import { getFileIcon } from "@/features/dokumenti/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888/web";

// Kreira mapu top-level included entiteta
function indexIncluded(included: any[] = []) {
  const map = new Map();
  for (const item of included) {
    map.set(`${item.type}:${item.id}`, item);
  }
  return map;
}

// Generiše pun URL fajla sa fallback-om
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

// Fetch sednice i dokumenata
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

    // DOKUMENTI
    const dokumenti: Dokument[] = [];
    const dokumentiRelRaw = item.relationships?.field_dokumenti_sednice?.data;
    const dokumentiRel = Array.isArray(dokumentiRelRaw)
      ? dokumentiRelRaw
      : dokumentiRelRaw
      ? [dokumentiRelRaw]
      : [];

    for (const rel of dokumentiRel) {
      const media = includedMap.get(`${rel.type}:${rel.id}`);
      if (!media) continue;

      // media je tvoj MEDIA objekat
      const fileRel = media.relationships?.field_dokument_file?.data;

      // može biti array ili single object
      const files = Array.isArray(fileRel) ? fileRel : [fileRel];

      for (const f of files) {
      if (!f) continue;

      // dohvat file entity iz includedMap
      const fileEntity = includedMap.get(`${f.type}:${f.id}`);
      if (!fileEntity) continue;

      // url fajla
      const fileUrl = getDrupalFileUrl(fileEntity);
      const fileMime = fileEntity.attributes?.filemime

      dokumenti.push({
        id: rel.id,
        title: media.attributes?.title || media.attributes?.name || "Dokument",
        url: fileUrl,
        mimeType: fileMime, // ostavljamo u objektu, ali ne prikazujemo
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

// Glavna stranica
export default async function SednicaPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  const sednica = await getSednica(id);
  if (!sednica) notFound();

  return (
    <div className="max-w-4xl">
      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {sednica.title}
        {sednica.status && <StatusBadge status={sednica.status} />}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(sednica.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* 📄 OPIS */}
      {!isEmptyHtml(sednica.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border"
          dangerouslySetInnerHTML={{ __html: sednica.body }}
        />
      )}

      {sednica.dokumenti && sednica.dokumenti.length > 0 && (
        <div className="mt-8 prose max-w-none bg-white p-5 rounded-2xl border">
          <ul className="list-none space-y-2">
            {sednica.dokumenti.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {getFileIcon(doc.mimeType)}
                  {doc.title} {/* NE prikazujemo MIME tip */}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

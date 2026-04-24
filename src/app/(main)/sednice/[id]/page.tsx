// src/app/(main)/sednice/[id]/page.tsx

import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";

import {
  FileText,
  Image,
  File,
  FileSpreadsheet,
  FileType,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

type FileItem = {
  url: string;
  filename?: string;
  mime?: string;
  description?: string;
  size?: number;
};

// -------------------- FILE SIZE --------------------
const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

// -------------------- FETCH --------------------
async function getSednica(id: string) {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/sednica/${id}?include=field_dokumenti_sednice`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const item = json.data;
    if (!item) return null;

    const included = json.included || [];

    const getFile = (fileId: string) => {
      const file = included.find((i: any) => i.id === fileId);
      if (!file) return null;

      const url = file.attributes?.uri?.url
        ? `${NEXT_PUBLIC_DRUPAL_BASE_URL}${file.attributes.uri.url}`
        : null;

      if (!url) return null;

      return {
        url,
        filename: file.attributes?.filename,
        mime: file.attributes?.filemime,
        size: file.attributes?.filesize ?? 0,
      };
    };

    const fileRel =
      item.relationships?.field_dokumenti_sednice?.data || [];

    const files: FileItem[] = Array.isArray(fileRel)
      ? fileRel
          .map((f: any) => {
            const base = getFile(f.id);
            if (!base) return null;

            return {
              ...base,
              description: f.meta?.description || base.filename,
            };
          })
          .filter(Boolean)
      : [];

    return {
      id: item.id,
      title: item.attributes?.title ?? "",
      body: item.attributes?.body?.value ?? "",
      created: item.attributes?.created ?? "",
      status: item.attributes?.field_status_sednice,
      files,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

// -------------------- ICON --------------------
function getIcon(mime: string) {
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("word")) return FileType;
  if (mime.includes("excel") || mime.includes("spreadsheet"))
    return FileSpreadsheet;
  if (mime.startsWith("image/")) return Image;
  return File;
}

// -------------------- PAGE --------------------
export default async function SednicaPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  const sednica = await getSednica(id);
  if (!sednica) notFound();

  return (
    <div className="max-w-4xl">
      <BackButton />

      {/* HEADER */}
      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {sednica.title}
        {sednica.status && (
          <StatusBadge status={sednica.status} />
        )}
      </h1>

      <p className="text-sm text-gray-500">
        {new Date(sednica.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="border-t my-8" />

      {/* BODY */}
      {!isEmptyHtml(sednica.body) && (
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: sednica.body }}
        />
      )}

      {/* FILES */}
      {sednica.files && sednica.files.length > 0 && (
        <>
          <div className="border-t my-8" />

          <ul>
            {sednica.files.map((file, i) => {
              const mime = file.mime || "";
              const Icon = getIcon(mime);
              const size = formatFileSize(file.size);

              const type = (() => {
                if (mime.includes("pdf")) return "PDF";
                if (mime.includes("word")) return "DOC";
                if (
                  mime.includes("excel") ||
                  mime.includes("spreadsheet")
                )
                  return "XLS";
                if (mime.startsWith("image/")) return "IMG";
                return "FILE";
              })();

              return (
                <li
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 min-w-0 text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    <Icon size={16} className="text-slate-400 shrink-0" />

                    <span className="truncate text-sm">
                      {file.description || file.filename || "Fajl"}
                    </span>
                  </a>

                  <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0 ml-3">
                    <span>{type}</span>
                    {size && <span>•</span>}
                    {size && <span>{size}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

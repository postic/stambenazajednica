import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
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
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

type FileItem = {
  url: string;
  filename?: string;
  mime?: string;
  description?: string;
  size?: number;
};

// SIZE
const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

// FETCH
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

    // ✅ SAFE FILE MAPPING (NO null, NO TS issues)
    const files: FileItem[] = [];

    if (Array.isArray(fileRel)) {
      for (const f of fileRel) {
        const base = getFile(f.id);
        if (!base) continue;

        files.push({
          url: base.url,
          filename: base.filename,
          mime: base.mime,
          size: base.size,
          description: f.meta?.description || base.filename,
        });
      }
    }

    return {
      id: item.id,
      title: item.attributes?.title ?? "",
      body: item.attributes?.body?.value ?? "",
      created: item.attributes?.created ?? "",
      status: item.attributes?.field_status_sednice,
      files,
    };
  } catch {
    return null;
  }
}

// ICON
function getIcon(mime: string) {
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("word")) return FileType;
  if (mime.includes("excel") || mime.includes("spreadsheet"))
    return FileSpreadsheet;
  if (mime.startsWith("image/")) return Image;
  return File;
}

// PAGE
export default async function SednicaPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) notFound();

  const sednica = await getSednica(id);
  if (!sednica) notFound();

  return (
    <div className="max-w-4xl text-gray-800">

      {/* Breadcrumb */}
      <div className="mb-4 ">
        <AppBreadcrumb title={sednica.title} />
      </div>

      {/* HEADER */}
      <div className="mb-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-xl font-semibold">
              {sednica.title}
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(sednica.created).toLocaleDateString("sr-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div>
            {sednica.status && (
              <StatusBadge status={sednica.status} />
            )}
          </div>

        </div>

        <div className="mt-3 border-b border-gray-200"></div>
      </div>

      {/* BODY */}
      {!isEmptyHtml(sednica.body) && (
        <div className="border border-gray-300 bg-slate-50 p-4 mb-6">
          <div
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sednica.body }}
          />
        </div>
      )}

      {/* FILES */}
      {sednica.files.length > 0 && (
        <div className="border border-gray-300 bg-white">

          <div className="px-4 py-2 border-b border-gray-300 bg-slate-50 text-sm font-medium">
            Dokumenti
          </div>

          <div className="divide-y divide-gray-200">

            {sednica.files.map((file, i) => {
              const mime = file.mime || "";
              const Icon = getIcon(mime);

              const size = formatFileSize(file.size);

              const type = (() => {
                if (mime.includes("pdf")) return "PDF";
                if (mime.includes("word")) return "DOC";
                if (mime.includes("excel") || mime.includes("spreadsheet"))
                  return "XLS";
                if (mime.startsWith("image/")) return "IMG";
                return "FILE";
              })();

              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    className="flex items-center gap-2 min-w-0 text-slate-700 hover:text-blue-600"
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
                </div>
              );
            })}

          </div>
        </div>
      )}

    </div>
  );
}

// src/app/(main)/dokumenti/[tip]/[id]/page.tsx

import { notFound } from "next/navigation";
import { getDokument } from "@/lib/drupal/getDokument";
import { isEmptyHtml } from "@/lib/text";
import StatusBadge from "@/components/StatusBadge";


import {
  FileText,
  File,
  FileSpreadsheet,
  FileType,
  Image,
} from "lucide-react";

// ---------------- ICON SYSTEM (SAME AS TRANSAKCIJE) ----------------
function getFileIcon(mime?: string) {
  if (!mime) return File;

  if (mime.includes("pdf")) return FileText;
  if (mime.includes("word")) return FileType;
  if (mime.includes("excel") || mime.includes("spreadsheet"))
    return FileSpreadsheet;
  if (mime.startsWith("image/")) return Image;

  return File;
}

// ---------------- PAGE ----------------
export default async function Page({
  params,
}: {
  params: Promise<{ tip: string; id: string }>;
}) {
  const { id } = await params;

  const dokument = await getDokument(id);
  if (!dokument) notFound();

  const createdDate = new Date(dokument.date?.value || dokument.date);

  const formattedDate = isNaN(createdDate.getTime())
    ? "Nepoznat"
    : createdDate.toLocaleDateString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const files = Array.isArray(dokument.files) ? dokument.files : [];

  return (
    <div className="max-w-4xl text-gray-800">

      {/* HEADER */}
      <div className="mb-6">

        <div className="flex items-start justify-between gap-4">

          {/* LEFT */}
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {dokument.title}
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              {formattedDate}
            </p>
          </div>

          {/* RIGHT (STATUS) */}
          <div className="flex items-center gap-2">
            {dokument.status && (
              <StatusBadge status={dokument.status} />
            )}
          </div>

        </div>

        {/* DIVIDER */}
        <div className="border-t border-slate-200 mt-4" />

</div>

      {/* FILES */}
      {files.length > 0 ? (
        <div className="border border-slate-200">

          {/* HEADER BAR */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-sm font-medium">
            Dokumenti
          </div>

          <ul>
            {files.map((file: any, i: number) => {
              const mime = file.mimeType || file.mime || "";
              const Icon = getFileIcon(mime);

              const type = mime.includes("pdf")
                ? "PDF"
                : mime.includes("word")
                ? "DOC"
                : mime.includes("excel") ||
                  mime.includes("spreadsheet")
                ? "XLS"
                : mime.startsWith("image/")
                ? "IMG"
                : "FILE";

              return (
                <li
                  key={i}
                  className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-b-0"
                >

                  {/* FILE LINK */}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 min-w-0"
                  >
                    <Icon size={16} className="text-slate-400 shrink-0" />

                    <span className="truncate">
                      {file.description ||
                        file.filename ||
                        "Dokument"}
                    </span>
                  </a>

                  {/* TYPE */}
                  <div className="text-xs text-slate-400 shrink-0 ml-3">
                    {type}
                  </div>

                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">Nema dokumenata.</p>
      )}

      {/* BODY */}
      {!isEmptyHtml(dokument.body) && (
        <div className="border border-slate-200 p-4 mt-6">
          <div
            className="text-sm text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: dokument.body }}
          />
        </div>
      )}

    </div>
  );
}

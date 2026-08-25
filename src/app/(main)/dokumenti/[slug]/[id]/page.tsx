import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import StatusBadge from "@/components/StatusBadge";

import {
  FileText,
  Image,
  File,
  FileSpreadsheet,
  FileType,
  Download,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

type FileItem = {
  url: string;
  filename?: string;
  mime?: string;
  description?: string;
  size?: number;
};

type Dokument = {
  id: string;
  title: string;
  body: string;
  created: string;
  status: string;

  category: {
    id: string;
    name: string;
    slug: string;
  } | null;

  files: FileItem[];
};

async function getDokument(
  slug: string,
  id: string
): Promise<Dokument | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const response =
      await fetch(
        `${baseUrl}/api/dokumenti/${slug}/${id}`,
        {
          cache: "no-store",
        }
      );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

// =========================================================
// FILE ICON
// =========================================================

function getIcon(mime: string) {
  if (mime.includes("pdf")) {
    return FileText;
  }

  if (
    mime.includes("word") ||
    mime.includes("document")
  ) {
    return FileType;
  }

  if (
    mime.includes("excel") ||
    mime.includes("spreadsheet")
  ) {
    return FileSpreadsheet;
  }

  if (mime.startsWith("image/")) {
    return Image;
  }

  return File;
}

// =========================================================
// FILE SIZE
// =========================================================

const formatFileSize = (
  bytes?: number
) => {
  if (!bytes) {
    return "";
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  const mb = kb / 1024;

  return `${mb.toFixed(1)} MB`;
};

// =========================================================
// FILE TYPE
// =========================================================

function getFileType(mime: string) {
  if (mime.includes("pdf")) {
    return "PDF";
  }

  if (
    mime.includes("word") ||
    mime.includes("document")
  ) {
    return "DOC";
  }

  if (
    mime.includes("excel") ||
    mime.includes("spreadsheet")
  ) {
    return "XLS";
  }

  if (mime.startsWith("image/")) {
    return "IMG";
  }

  return "FILE";
}

// =========================================================
// PAGE
// =========================================================

export default async function DokumentPage({
  params,
}: PageProps) {
  const { slug, id } =
    await params;

  if (!slug || !id) {
    notFound();
  }

  const dokument =
    await getDokument(
      slug,
      id
    );

  if (!dokument) {
    notFound();
  }

  return (
    <div className="max-w-4xl">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">

        <div className="flex items-start justify-between gap-4">

          <div data-field>

            <h1 className="text-xl font-semibold">
              {dokument.title}
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              {new Date(
                dokument.created
              ).toLocaleDateString(
                "sr-Latn-RS",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>

          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">

            {dokument.status && (
              <StatusBadge
                status={
                  dokument.status
                }
              />
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          BODY
      ===================================================== */}

      {!isEmptyHtml(
        dokument.body
      ) && (
        <div className="border border-gray-300 bg-slate-50 p-4 mb-6">

          <div
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                dokument.body,
            }}
          />

        </div>
      )}

      {/* =====================================================
          FILES
      ===================================================== */}

      {dokument.files.length > 0 && (
        <div className="border border-gray-300 bg-white">

          <div className="px-4 py-2 border-b border-gray-300 bg-slate-50 text-sm font-medium">
            Dokumenti
          </div>

          <div className="divide-y divide-gray-200">

            {dokument.files.map(
              (file, i) => {

                const mime =
                  file.mime || "";

                const Icon =
                  getIcon(mime);

                const size =
                  formatFileSize(
                    file.size
                  );

                const type =
                  getFileType(mime);

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3"
                  >

                    {/* =================================================
                        FILE NAME
                    ================================================= */}

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 min-w-0 text-slate-700"
                    >

                      <Icon
                        size={16}
                        className="text-slate-400 shrink-0"
                      />

                      <span className="truncate text-sm">
                        {file.description ||
                          file.filename ||
                          "Fajl"}
                      </span>

                    </a>

                    {/* =================================================
                        TYPE / SIZE / DOWNLOAD
                    ================================================= */}

                    <div className="flex items-center gap-3 shrink-0 ml-3">

                      <div className="flex items-center gap-2 text-xs text-gray-400">

                        <span>
                          {type}
                        </span>

                        {size && (
                          <>
                            <span>
                              •
                            </span>

                            <span>
                              {size}
                            </span>
                          </>
                        )}

                      </div>

                      {/* DOWNLOAD */}

                      <a
                        href={file.url}
                        download={
                          file.filename ||
                          undefined
                        }
                        className="inline-flex items-center justify-center text-gray-400 hover:text-slate-700"
                        title="Preuzmi fajl"
                        aria-label="Preuzmi fajl"
                      >
                        <Download
                          size={16}
                        />
                      </a>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}

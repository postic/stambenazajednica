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

// =========================================================
// TYPES
// =========================================================

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

// =========================================================
// GET DOKUMENT
// =========================================================

async function getDokument(
  slug: string,
  id: string
): Promise<Dokument | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const url =
      `${baseUrl}/api/dokumenti/` +
      `${encodeURIComponent(slug)}/` +
      `${encodeURIComponent(id)}`;

    console.log(
      "GET DOKUMENT:",
      url
    );

    const response = await fetch(url, {
      cache: "no-store",
    });

    console.log(
      "DOKUMENT STATUS:",
      response.status
    );

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "DOKUMENT API ERROR:",
        response.status,
        text
      );

      return null;
    }

    const data =
      await response.json();

    return data;
  } catch (error) {
    console.error(
      "GET DOKUMENT ERROR:",
      error
    );

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

function formatFileSize(
  bytes?: number
) {
  if (!bytes) {
    return "";
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  const mb = kb / 1024;

  return `${mb.toFixed(1)} MB`;
}

// =========================================================
// FILE TYPE
// =========================================================

function getFileType(
  mime: string
) {
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
  const {
    slug,
    id,
  } = await params;

  // =======================================================
  // PARAMS
  // =======================================================

  if (!slug || !id) {
    notFound();
  }

  // =======================================================
  // DOKUMENT
  // =======================================================

  const dokument =
    await getDokument(
      slug,
      id
    );

  if (!dokument) {
    notFound();
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div className="max-w-4xl">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-6">

        <div className="flex items-start justify-between gap-4">

          {/* TITLE */}

          <div data-field>

            <h1 className="text-xl font-semibold">
              {dokument.title}
            </h1>

            {/* DATE */}

            {dokument.created && (
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
            )}

          </div>

          {/* STATUS */}

          {dokument.status && (
            <div className="flex items-center gap-2 flex-wrap justify-end">

              <StatusBadge
                status={
                  dokument.status
                }
              />

            </div>
          )}

        </div>

      </div>

      {/* ===================================================
          BODY
      =================================================== */}

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

      {/* ===================================================
          FILES
      =================================================== */}

      {dokument.files &&
        dokument.files.length > 0 && (
          <div className="border border-gray-300 bg-white">

            {/* HEADER */}

            <div className="px-4 py-2 border-b border-gray-300 bg-slate-50 text-sm font-medium">
              Dokumenti
            </div>

            {/* FILE LIST */}

            <div className="divide-y divide-gray-200">

              {dokument.files.map(
                (file, index) => {

                  const mime =
                    file.mime || "";

                  const Icon =
                    getIcon(mime);

                  const size =
                    formatFileSize(
                      file.size
                    );

                  const type =
                    getFileType(
                      mime
                    );

                  return (
                    <div
                      key={`${file.url}-${index}`}
                      className="flex items-center justify-between px-4 py-3"
                    >

                      {/* ===================================
                          FILE NAME
                      =================================== */}

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 min-w-0 text-slate-700"
                        title={
                          file.filename ||
                          "Otvori fajl"
                        }
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

                      {/* ===================================
                          TYPE / SIZE / DOWNLOAD
                      =================================== */}

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

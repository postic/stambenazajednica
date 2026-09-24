import { headers } from "next/headers";
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
): Promise<{
  dokument: Dokument | null;
  error?: string;
  status?: number;
  url?: string;
}> {
  try {
    // =======================================================
    // CURRENT HOST
    // =======================================================

    const headersList = await headers();

    const host =
      headersList.get("host");

    const protocol =
      process.env.NODE_ENV === "development"
        ? "http"
        : "https";

    if (!host) {
      return {
        dokument: null,
        error:
          "Nije moguće odrediti host aplikacije.",
      };
    }

    // =======================================================
    // NEXT.JS API URL
    // =======================================================

    const url =
      `${protocol}://${host}` +
      `/api/dokumenti/` +
      `${encodeURIComponent(slug)}/` +
      `${encodeURIComponent(id)}`;

    console.log(
      "================================="
    );

    console.log(
      "NEXT.JS DOKUMENT API"
    );

    console.log(
      "slug:",
      slug
    );

    console.log(
      "id:",
      id
    );

    console.log(
      "URL:",
      url
    );

    console.log(
      "================================="
    );

    // =======================================================
    // FETCH NEXT.JS API
    // =======================================================

    const response =
      await fetch(url, {
        cache: "no-store",
      });

    console.log(
      "API STATUS:",
      response.status
    );

    const text =
      await response.text();

    console.log(
      "API RESPONSE:",
      text
    );

    // =======================================================
    // ERROR
    // =======================================================

    if (!response.ok) {
      return {
        dokument: null,
        status:
          response.status,
        error: text,
        url,
      };
    }

    // =======================================================
    // JSON
    // =======================================================

    let data: Dokument;

    try {
      data =
        JSON.parse(text);
    } catch (error) {
      console.error(
        "JSON PARSE ERROR:",
        error
      );

      return {
        dokument: null,
        status:
          response.status,
        error:
          "API nije vratila validan JSON.",
        url,
      };
    }

    // =======================================================
    // CHECK
    // =======================================================

    if (
      !data ||
      !data.id
    ) {
      return {
        dokument: null,
        status:
          response.status,
        error:
          "API je vratila prazan ili neispravan dokument.",
        url,
      };
    }

    return {
      dokument: data,
      status:
        response.status,
      url,
    };
  } catch (error) {
    console.error(
      "GET DOKUMENT ERROR:",
      error
    );

    return {
      dokument: null,
      error:
        error instanceof Error
          ? error.message
          : "Nepoznata greška",
    };
  }
}

// =========================================================
// FILE ICON
// =========================================================

function getIcon(
  mime: string
) {
  if (
    mime.includes("pdf")
  ) {
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

  if (
    mime.startsWith("image/")
  ) {
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

  const kb =
    bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  const mb =
    kb / 1024;

  return `${mb.toFixed(1)} MB`;
}

// =========================================================
// FILE TYPE
// =========================================================

function getFileType(
  mime: string
) {
  if (
    mime.includes("pdf")
  ) {
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

  if (
    mime.startsWith("image/")
  ) {
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
  // =======================================================
  // PARAMS
  // =======================================================

  const {
    slug,
    id,
  } = await params;

  console.log(
    "DOKUMENT PAGE PARAMS:",
    {
      slug,
      id,
    }
  );

  // =======================================================
  // PARAM CHECK
  // =======================================================

  if (!slug || !id) {
    notFound();
  }

  // =======================================================
  // GET DOKUMENT
  // =======================================================

  const result =
    await getDokument(
      slug,
      id
    );

  const dokument =
    result.dokument;

  // =======================================================
  // ERROR
  // =======================================================

  if (!dokument) {
    return (
      <div className="max-w-4xl">

        <div className="border border-red-300 bg-red-50 p-5">

          <h1 className="text-lg font-semibold text-red-700">
            Dokument nije pronađen
          </h1>

          <div className="mt-4 space-y-1 text-sm text-red-700">

            <p>
              <strong>
                Slug:
              </strong>{" "}
              {slug}
            </p>

            <p>
              <strong>
                ID:
              </strong>{" "}
              {id}
            </p>

            <p>
              <strong>
                API status:
              </strong>{" "}
              {result.status ??
                "NEMA"}
            </p>

            <p className="break-all">
              <strong>
                API URL:
              </strong>{" "}
              {result.url ??
                "NEMA"}
            </p>

          </div>

          {result.error && (
            <div className="mt-4">

              <p className="text-sm font-medium text-red-700">
                API odgovor:
              </p>

              <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs text-red-600">
                {result.error}
              </pre>

            </div>
          )}

        </div>

      </div>
    );
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

          <div data-field>

            <h1 className="text-xl font-semibold">
              {dokument.title}
            </h1>

            {dokument.created && (
              <p className="mt-1 text-sm text-slate-400">
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

          {dokument.status && (
            <div className="flex flex-wrap items-center justify-end gap-2">

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
        <div className="mb-6 border border-gray-300 bg-slate-50 p-4">

          <div
            className="text-sm leading-relaxed text-gray-700"
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

      {dokument.files?.length > 0 && (
        <div className="border border-gray-300 bg-white">

          <div className="border-b border-gray-300 bg-slate-50 px-4 py-2 text-sm font-medium">
            Dokumenti
          </div>

          <div className="divide-y divide-gray-200">

            {dokument.files.map(
              (
                file,
                index
              ) => {

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

                    {/* FILE */}

                    <a
                      href={
                        file.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 items-center gap-2 text-slate-700"
                      title={
                        file.filename ||
                        "Otvori fajl"
                      }
                    >

                      <Icon
                        size={16}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="truncate text-sm">
                        {file.description ||
                          file.filename ||
                          "Fajl"}
                      </span>

                    </a>

                    {/* INFO */}

                    <div className="ml-3 flex shrink-0 items-center gap-3">

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
                        href={
                          file.url
                        }
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

      {/* ===================================================
          NO FILES
      =================================================== */}

      {(!dokument.files ||
        dokument.files.length === 0) && (
        <div className="border border-gray-300 bg-slate-50 p-4 text-sm text-slate-500">
          Dokument nema priloženih fajlova.
        </div>
      )}

    </div>
  );
}

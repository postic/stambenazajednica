import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import StatusBadge from "@/components/StatusBadge";

import {
  FileText,
  Image,
  File,
  FileSpreadsheet,
  FileType,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
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
// SIZE
// =========================================================

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  const mb = kb / 1024;

  return `${mb.toFixed(1)} MB`;
};

// =========================================================
// ICON
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
// FETCH
// =========================================================

async function getDokument(
  slug: string,
  id: string
): Promise<Dokument | null> {
  try {
    const url =
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}` +
      `/jsonapi/node/dokument/${id}` +
      `?include=field_tip_dokumenta,field_dokument`;

    const response = await fetch(url, {
      headers: {
        Accept:
          "application/vnd.api+json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();

    const item = json.data;

    if (!item) {
      return null;
    }

    const included =
      json.included || [];

    // =======================================================
    // CATEGORY
    // =======================================================

    const categoryId =
      item.relationships
        ?.field_tip_dokumenta
        ?.data?.id || null;

    let category = null;

    if (categoryId) {
      const categoryItem =
        included.find(
          (i: any) =>
            i.type ===
              "taxonomy_term--tip_dokumenta" &&
            i.id === categoryId
        );

      if (categoryItem) {
        const name =
          categoryItem.attributes?.name ||
          "";

        category = {
          id: categoryItem.id,
          name,
          slug: name
            .toLowerCase()
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            )
            .replace(
              /đ/g,
              "d"
            )
            .replace(
              /[^a-z0-9]+/g,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              ""
            ),
        };
      }
    }

    // =======================================================
    // FILES
    // =======================================================

    const files: FileItem[] = [];

    const fileRel =
      item.relationships
        ?.field_dokument
        ?.data || [];

    if (Array.isArray(fileRel)) {
      for (const fileReference of fileRel) {
        const file = included.find(
          (i: any) =>
            i.id === fileReference.id
        );

        if (!file) {
          continue;
        }

        const fileUrl =
          file.attributes?.uri?.url;

        if (!fileUrl) {
          continue;
        }

        const url =
          fileUrl.startsWith("http")
            ? fileUrl
            : `${NEXT_PUBLIC_DRUPAL_BASE_URL}${fileUrl}`;

        files.push({
          url,
          filename:
            file.attributes?.filename,
          mime:
            file.attributes?.filemime,
          size:
            file.attributes?.filesize ?? 0,
          description:
            fileReference.meta
              ?.description ||
            file.attributes?.filename,
        });
      }
    }

    // =======================================================
    // RETURN
    // =======================================================

    return {
      id: item.id,

      title:
        item.attributes?.title ||
        "",

      body:
        item.attributes?.body?.value ||
        "",

      created:
        item.attributes?.created ||
        "",

      status:
        item.attributes
          ?.field_status_dokumenta ||
        "",

      category,

      files,
    };
  } catch (error) {
    console.error(
      "Greška pri učitavanju dokumenta:",
      error
    );

    return null;
  }
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

            <p className="text-sm text-gray-400 mt-1">
              {dokument.created &&
                new Date(
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

          <div>
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
                  (() => {

                    if (
                      mime.includes(
                        "pdf"
                      )
                    ) {
                      return "PDF";
                    }

                    if (
                      mime.includes(
                        "word"
                      )
                    ) {
                      return "DOC";
                    }

                    if (
                      mime.includes(
                        "excel"
                      ) ||
                      mime.includes(
                        "spreadsheet"
                      )
                    ) {
                      return "XLS";
                    }

                    if (
                      mime.startsWith(
                        "image/"
                      )
                    ) {
                      return "IMG";
                    }

                    return "FILE";
                  })();

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3"
                  >

                    {/* FILE LINK */}

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

                    {/* FILE INFO */}

                    <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0 ml-3">

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

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
    id: string;
  }>;
}

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

type FileItem = {
  id: string;
  url: string;
  filename?: string;
  mime?: string;
  description?: string;
  size?: number;
};

type Sednica = {
  id: string;
  title: string;
  body: string;
  created: string;
  status: string;
  files: FileItem[];
};

function formatFileSize(bytes?: number) {
  if (!bytes) return "";

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

function getIcon(mime: string) {
  if (mime.includes("pdf")) return FileText;

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

function getFileType(mime: string) {
  if (mime.includes("pdf")) return "PDF";

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

async function getSednica(
  id: string
): Promise<Sednica | null> {
  try {
    const response = await fetch(
      `${DRUPAL_BASE_URL}/jsonapi/node/sednica/${id}?include=field_dokumenti_sednice`,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Greška pri učitavanju sednice:",
        response.status,
        await response.text()
      );

      return null;
    }

    const json = await response.json();
    const item = json.data;

    if (!item) {
      return null;
    }

    const included = json.included || [];

    const fileRelationship =
      item.relationships?.field_dokumenti_sednice?.data;

    const fileReferences = Array.isArray(fileRelationship)
      ? fileRelationship
      : fileRelationship
        ? [fileRelationship]
        : [];

    const files: FileItem[] = [];

    for (const reference of fileReferences) {
      const file = included.find(
        (entry: any) =>
          entry.type === "file--file" &&
          entry.id === reference.id
      );

      if (!file) continue;

      const filePath = file.attributes?.uri?.url;

      if (!filePath) continue;

      const url = filePath.startsWith("http")
        ? filePath
        : `${DRUPAL_BASE_URL}${filePath}`;

      files.push({
        id: file.id,
        url,
        filename: file.attributes?.filename || "",
        mime: file.attributes?.filemime || "",
        size: file.attributes?.filesize || 0,
        description:
          reference.meta?.description ||
          file.attributes?.filename ||
          "Dokument",
      });
    }

    return {
      id: item.id,
      title: item.attributes?.title || "",
      body: item.attributes?.body?.value || "",
      created: item.attributes?.created || "",
      status:
        item.attributes?.field_status_sednice || "",
      files,
    };
  } catch (error) {
    console.error(
      "Greška pri učitavanju sednice:",
      error
    );

    return null;
  }
}

export default async function SednicaPage({
  params,
}: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const sednica = await getSednica(id);

  if (!sednica) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div data-field>
            <h1 className="text-xl font-semibold">
              {sednica.title}
            </h1>

            {sednica.created && (
              <p className="mt-1 text-sm text-gray-400">
                {new Date(
                  sednica.created
                ).toLocaleDateString("sr-Latn-RS", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {sednica.status && (
            <StatusBadge status={sednica.status} />
          )}
        </div>
      </div>

      {/* BODY */}
      {!isEmptyHtml(sednica.body) && (
        <div className="mb-6 border border-gray-300 bg-slate-50 p-4">
          <div
            className="text-sm leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{
              __html: sednica.body,
            }}
          />
        </div>
      )}

      {/* DOKUMENTI SEDNICE */}
      {sednica.files.length > 0 && (
        <div className="border border-gray-300 bg-white">
          <div className="border-b border-gray-300 bg-slate-50 px-4 py-2 text-sm font-medium">
            Dokumenti sednice
          </div>

          <div className="divide-y divide-gray-200">
            {sednica.files.map((file) => {
              const mime = file.mime || "";
              const Icon = getIcon(mime);
              const size = formatFileSize(file.size);
              const type = getFileType(mime);

              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-2 text-slate-700"
                  >
                    <Icon
                      size={16}
                      className="shrink-0 text-slate-400"
                    />

                    <span className="truncate text-sm">
                      {file.description ||
                        file.filename ||
                        "Dokument"}
                    </span>
                  </a>

                  <div className="ml-3 flex shrink-0 items-center gap-2 text-xs text-gray-400">
                    <span>{type}</span>

                    {size && (
                      <>
                        <span>•</span>
                        <span>{size}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NEMA DOKUMENATA */}
      {sednica.files.length === 0 && (
        <p className="text-sm text-gray-500">
          Za ovu sednicu nisu priloženi dokumenti.
        </p>
      )}
    </div>
  );
}

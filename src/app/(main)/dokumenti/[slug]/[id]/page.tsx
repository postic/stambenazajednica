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



    </div>
  );
}

import { notFound } from "next/navigation";
import { isEmptyHtml, formatRSD } from "@/lib/text";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";
import type { TransakcijaWithBalance } from "@/types/transakcija";
import { addRunningBalance } from "@/lib/transactions";

import {
  FileText,
  Image,
  File,
  FileSpreadsheet,
  FileType,
} from "lucide-react";

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

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

async function getTransakcija(
  id: string
): Promise<TransakcijaWithBalance | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/transakcija?page[limit]=100&include=field_faktura`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const json = await res.json();
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

    const raw = (json.data || []).map((item: any) => {
      const fileRel = item.relationships?.field_faktura?.data || [];

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
        amount: Number(item.attributes?.field_iznos ?? 0),
        type: item.attributes?.field_tip ?? "",
        created: item.attributes?.created ?? "",
        files,
      };
    });

    const withBalance = addRunningBalance(raw);

    return withBalance.find((t) => t.id === id) ?? null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function TransakcijaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tx = await getTransakcija(id);

  if (!tx) notFound();

  return (
    <div className="max-w-4xl">
      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {tx.title}
        <StatusBadge status={tx.type ?? "unknown"} />
      </h1>

      <p className="text-sm text-gray-500">
        {new Date(tx.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="border-t my-8" />

      {/* INFO */}
      <div className="space-y-4 text-sm font-mono">
        <div className="flex justify-between">
          <span className="text-gray-500">Tip:</span>
          <span className="text-gray-800">{tx.type}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Iznos:</span>
          <span className="text-gray-800 tabular-nums">
            {formatRSD(tx.amount)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Stanje:</span>
          <span className="text-gray-800 tabular-nums">
            {formatRSD(tx.balance ?? 0)}
          </span>
        </div>
      </div>

      {/* BODY */}
      {!isEmptyHtml(tx.body) && <div className="border-t my-8" />}

      {!isEmptyHtml(tx.body) && (
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: tx.body }}
        />
      )}

      {/* FILES */}
      {tx.files && tx.files.length > 0 && (
        <>
          {/* BORDER ABOVE FILES */}
          <div className="border-t my-8" />

          <ul>
            {tx.files.map((file, i) => {
              const mime = file.mime || "";

              let Icon = File;

              if (mime.includes("pdf")) Icon = FileText;
              else if (mime.includes("word")) Icon = FileType;
              else if (
                mime.includes("excel") ||
                mime.includes("spreadsheet")
              )
                Icon = FileSpreadsheet;
              else if (mime.startsWith("image/")) Icon = Image;

              const type = (() => {
                if (mime.includes("pdf")) return "PDF";
                if (mime.includes("word")) return "DOC";
                if (mime.includes("excel") || mime.includes("spreadsheet"))
                  return "XLS";
                if (mime.startsWith("image/")) return "IMG";
                return "FILE";
              })();

              const size = formatFileSize(file.size);

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

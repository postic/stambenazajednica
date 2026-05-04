import { notFound } from "next/navigation";
import { isEmptyHtml, formatRSD } from "@/lib/text";
import StatusBadge from "@/components/StatusBadge";
import type { TransakcijaDetail, FileItem } from "@/types/transakcija";
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

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

async function getTransakcija(
  id: string
): Promise<TransakcijaDetail | null> {
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
        amount: Number(item.attributes?.field_iznos ?? 0),
        type: item.attributes?.field_tip ?? "",
        created: item.attributes?.created ?? "",
        files,
      };
    });

    // 🔥 SIMPLE FIX (CAST)
    const withBalance = addRunningBalance(raw) as TransakcijaDetail[];

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

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mt-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {tx.title}
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              {new Date(tx.created).toLocaleDateString("sr-Latn-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <StatusBadge status={tx.type ?? "unknown"} />

              <div className="text-xl font-semibold tabular-nums text-slate-900">
                {formatRSD(tx.amount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* META */}
      <div className="border border-slate-200 bg-slate-50 p-4 mb-6">
        <div className="grid grid-cols-2 gap-y-3 text-sm font-mono">
          <div className="text-slate-500">Tip</div>
          <div className="text-slate-800">{tx.type}</div>

          <div className="text-slate-500">Iznos</div>
          <div className="text-slate-800 tabular-nums">
            {formatRSD(tx.amount)}
          </div>

          <div className="text-slate-500">Stanje</div>
          <div className="text-slate-800 tabular-nums">
            {formatRSD(tx.balance ?? 0)}
          </div>
        </div>
      </div>

      {/* BODY */}
      {!isEmptyHtml(tx.body) && (
        <div className="border border-slate-200 p-4 mb-6">
          <div
            className="text-sm text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: tx.body }}
          />
        </div>
      )}

      {/* FILES */}
      {tx.files.length > 0 && (
        <div className="border border-slate-200">

          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-sm font-medium">
            Dokumenti
          </div>

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

              const size = formatFileSize(file.size);

              return (
                <li
                  key={i}
                  className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-b-0"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 min-w-0"
                  >
                    <Icon size={16} className="text-slate-400 shrink-0" />

                    <span className="truncate">
                      {file.description || file.filename || "Fajl"}
                    </span>
                  </a>

                  <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 ml-3">
                    <span>{mime.split("/")[1]?.toUpperCase() || "FILE"}</span>
                    {size && <span>•</span>}
                    {size && <span>{size}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

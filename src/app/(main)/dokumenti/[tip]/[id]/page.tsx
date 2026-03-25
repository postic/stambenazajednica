// src/app/(main)/dokumenti/[tip]/[id]/page.tsx
import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import { getDokument } from "@/lib/drupal/getDokument";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";
import { getFileIcon } from "@/features/dokumenti/utils";

export default async function Page({
  params,
}: {
  params: Promise<{ tip: string; id: string }>;
}) {
  const { tip, id } = await params;

  const dokument = await getDokument(id);
  if (!dokument) return notFound();

  const createdDate = new Date(dokument.date?.value || dokument.date);

  const formattedDate = isNaN(createdDate.getTime())
    ? "Nepoznat"
    : createdDate.toLocaleDateString("sr-RS");

  const files = Array.isArray(dokument.files) ? dokument.files : [];

  const firstFile = files[0];
  const isPdf = firstFile?.mime?.includes("pdf");

  return (
    <div className="max-w-4xl">
      {/* BACK */}
      <BackButton />

      {/* TITLE */}
      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {dokument.title}
        {dokument.status && <StatusBadge status={dokument.status} />}
      </h1>

      {/* DATE */}
      <p className="text-gray-500 text-sm mb-6">
        {new Date(dokument.date).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* FILES */}
      {files.length > 0 ? (
        <div className="mt-6 bg-white p-5 mb-6 rounded-2xl border space-y-4">
          {files.map((f: any) => (
            <div
              key={f.id}
              className="flex items-center gap-3 border rounded-xl p-4 hover:bg-gray-50 transition"
            >
              <span className="text-xl">{getFileIcon(f.mime)}</span>

              <div className="flex-1">
                {/* 👇 KLJUČNA IZMENA */}
                <div className="font-medium">
                  {f.description || f.filename}
                </div>

                <div className="text-sm text-gray-500">{f.mime}</div>
              </div>

              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Otvori
              </a>
            </div>
          ))}

          {/* 📄 AUTO PDF PREVIEW */}
          {files.length === 1 && isPdf && (
            <div className="mt-4 border rounded-xl overflow-hidden">
              <iframe
                src={firstFile.url}
                className="w-full h-[600px]"
              />
            </div>
          )}
        </div>
      ) : (
        <p>Nema fajlova.</p>
      )}

      {/* OPIS */}
      {!isEmptyHtml(dokument.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border"
          dangerouslySetInnerHTML={{ __html: dokument.body }}
        />
      )}
    </div>
  );
}

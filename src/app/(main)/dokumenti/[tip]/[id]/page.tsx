// src/app/(main)/dokumenti/[tip]/[id]/page.tsx
import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import { getDokument } from "@/lib/drupal/getDokument";
import StatusBadge from "@/components/StatusBadge";
import BackButton from "@/components/BackButton";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt } from "react-icons/fa";

const getFileIcon = (mime?: string): ReactNode => {
  if (!mime) return <FaFileAlt className="text-gray-400" />;
  if (mime.includes("pdf")) return <FaFilePdf className="text-red-500" />;
  if (mime.includes("word")) return <FaFileWord className="text-blue-500" />;
  if (mime.includes("excel")) return <FaFileExcel className="text-green-500" />;
  return <FaFileAlt className="text-gray-400" />;
};


export default async function Page({ params }: { params: Promise<{ tip: string; id: string }> }) {
  const { tip, id } = await params;

  // fetch dokumenta
  const dokument = await getDokument(id);

  if (!dokument) return notFound(); // 404 ako ne postoji

  // datum kreiranja
  const createdDate = new Date(dokument.date?.value || dokument.date);
  const formattedDate = isNaN(createdDate.getTime())
    ? "Nepoznat"
    : createdDate.toLocaleDateString("sr-RS");

  // fajlovi
  const files = Array.isArray(dokument.files) ? dokument.files : [];

  return (
    <div className="max-w-4xl">

      {/* 🔙 BACK BUTTON */}
      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {dokument.title}
        {dokument.status && <StatusBadge status={dokument.status} />}
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(dokument.date).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {files.length > 0 ? (
        <div className="mt-6 prose max-w-none bg-white p-5 mb-6 rounded-2xl border">
          <ul className="list-none space-y-2">
          {files.map((f: any) => (
            <li key={f.id}>

            <a
  href={f.url}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 text-blue-600 hover:underline"
>
  {getFileIcon(f.mime)}
  <span>{f.filename}</span>
</a>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p>Nema fajlova.</p>
    )}

    {/* 📄 OPIS */}
      {!isEmptyHtml(dokument.body) && (
        <div
          className="prose max-w-none bg-white p-5 rounded-2xl border"
          dangerouslySetInnerHTML={{ __html: dokument.body }}
        />
      )}

    </div>
  );
}

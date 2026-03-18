// src/app/(main)/dokumenti/[tip]/[id]/page.tsx
import { notFound } from "next/navigation";
import { getDokument } from "@/lib/drupal/getDokument";
import BackButton from "@/components/BackButton";

export default async function Page({ params }: { params: Promise<{ tip: string; id: string }> }) {
  const { tip, id } = await params;

  // fetch dokumenta
  const dokument = await getDokument(id);

  if (!dokument) return notFound(); // 404 ako ne postoji

  // datum kreiranja
  const createdDate = new Date(dokument.created?.value || dokument.created);
  const formattedDate = isNaN(createdDate.getTime())
    ? "Nepoznat"
    : createdDate.toLocaleDateString("sr-RS");

  // fajlovi
  const files = Array.isArray(dokument.files) ? dokument.files : [];

  return (
    <div className="max-w-4xl">

      {/* 🔙 BACK BUTTON */}
      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">{dokument.title}</h1>
      <p className="text-gray-500 text-sm mb-6">
        {new Date(dokument.date).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <p className="mb-2"><strong>Tip:</strong> {tip}</p>

      {files.length > 0 ? (
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Naziv fajla</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Opis</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f: any) => (
            <tr key={f.id}>
              <td className="border border-gray-300 px-4 py-2">
                <a href={f.url} target="_blank" className="text-blue-600 hover:underline">
                  {f.filename}
                </a>
              </td>
              <td className="border border-gray-300 px-4 py-2">{f.mime || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>Nema fajlova.</p>
    )}
    </div>
  );
}

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
      <h2 className="mt-4 font-semibold">Fajlovi:</h2>
      {files.length > 0 ? (
        <ul className="list-disc ml-6">
          {files.map((f: any) => (
            <li key={f.id}>
              <a href={f.url} target="_blank" className="text-blue-600 hover:underline">
                {f.filename || "Neimenovani fajl"}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nema fajlova.</p>
      )}
    </div>
  );
}

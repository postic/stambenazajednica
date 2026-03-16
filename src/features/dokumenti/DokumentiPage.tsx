import { getDokumenti } from "@/lib/drupal/getDokumenti";
import DokumentiTable from "@/features/dokumenti/DokumentiTable";
import { Dokument } from "@/features/dokumenti/types";

interface PageProps {
  params: Promise<{ tip: string }>;
}

export default async function DokumentiPage({ params }: PageProps) {
  const { tip } = await params;
  const dokumentiRaw = await getDokumenti(tip);

  const dokumenti: Dokument[] = dokumentiRaw.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    status: doc.status || null,
    date: doc.date || null,
    files: doc.files.map((file: any) => ({
      id: file.id,
      url: file.url,
      mimeType: file.mimeType,
    })),
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dokumenti: {tip}</h1>

      {dokumenti.length === 0 ? (
        <p className="text-gray-500">Nema dokumenata.</p>
      ) : (
        <DokumentiTable dokumenti={dokumenti} />
      )}
    </div>
  );
}

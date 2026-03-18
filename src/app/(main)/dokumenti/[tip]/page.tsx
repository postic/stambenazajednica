import { getDokumenti } from "@/lib/drupal/getDokumenti";
import DokumentiTable from "./DokumentiTable";
import { Dokument } from "@/features/dokumenti/types";

interface PageProps {
  params: Promise<{ tip: string }>;
}

export default async function DokumentiPage({ params }: PageProps) {
  const { tip } = await params;
  const dokumentiRaw = await getDokumenti(tip);

  //console.error('DOKUMENTI (NE FAJLOVI!!!!!!!!) IZABRANE KATEGORIJE:', dokumentiRaw);

  const dokumenti: Dokument[] = dokumentiRaw.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    created: doc.created,
    type: tip,
    files: doc.files.map((file: any) => ({
      id: file.id,
      url: file.url,
      mimeType: file.mimeType,
    })),
  }));

  return (
    <div>
      <h1 className="text-base uppercase tracking-wide font-semibold text-slate-700 mb-6">{tip}</h1>

      {dokumenti.length === 0 ? (
        <p className="text-gray-500">Nema dokumenata.</p>
      ) : (
        <DokumentiTable dokumenti={dokumenti} />
      )}
    </div>
  );
}

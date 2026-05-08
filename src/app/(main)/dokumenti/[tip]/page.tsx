import { getDokumenti } from "@/lib/drupal/getDokumenti";
import DokumentiTable from "@/features/dokumenti/DokumentiTable";
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
    status: doc.status,
    files: doc.files.map((file: any) => ({
      id: file.id,
      url: file.url,
      mimeType: file.mimeType,
    })),
  }));

  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            {tip}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Digitalna arhiva stambene zajednice</p>
        </div>

      </div>

      {dokumenti.length === 0 ? (
        <p className="text-gray-500">Nema dokumenata.</p>
      ) : (
        <DokumentiTable dokumenti={dokumenti} />
      )}
    </div>
  );
}

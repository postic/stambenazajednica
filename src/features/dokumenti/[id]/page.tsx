import { getDokumenti } from "@/lib/drupal/getDokumenti";
import DokumentDetail from "@/features/dokumenti/DokumentDetail";
import { Dokument } from "@/features/dokumenti/types";

interface PageProps {
  params: { id: string; tip: string };
}

export default async function DokumentDetailPage({ params }: PageProps) {
  const dokumentiRaw = await getDokumenti(params.tip);
  const dokumentData = dokumentiRaw.find((d: any) => d.id === params.id);

  if (!dokumentData) return <p>Dokument nije pronađen.</p>;

  const dokument: Dokument = {
    id: dokumentData.id,
    title: dokumentData.title,
    status: dokumentData.status || null,
    date: dokumentData.date || null,
    files: dokumentData.files.map((file: any) => ({
      id: file.id,
      url: file.url,
      mimeType: file.mimeType,
    })),
  };

  return (
    <div className="p-6">
      <DokumentDetail dokument={dokument} />
    </div>
  );
}

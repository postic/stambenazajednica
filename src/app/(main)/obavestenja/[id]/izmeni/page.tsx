import ObavestenjeEditForm from "./ObavestenjeEditForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditObavestenjePage({
  params,
}: PageProps) {
  const { id } = await params;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Izmeni obaveštenje
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Izmenite naslov ili tekst obaveštenja.
        </p>
      </div>

      <ObavestenjeEditForm id={id} />
    </div>
  );
}

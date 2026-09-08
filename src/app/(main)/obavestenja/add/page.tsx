import ObavestenjeForm from "@/features/obavestenja/ObavestenjeForm";

export default function DodajObavestenjePage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Dodaj obaveštenje
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Unesite podatke za novo obaveštenje.
        </p>
      </div>

      <ObavestenjeForm />
    </div>
  );
}

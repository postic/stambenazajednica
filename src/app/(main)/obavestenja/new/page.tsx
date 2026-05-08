import { notFound } from "next/navigation";
import ObavestenjeForm from "./ObavestenjeForm";
//import { getObavestenje, Obavestenje } from "@/lib/kvar";

export default function NewObavestenjePage() {
  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            Novo obaveštenje
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Objavite novosti i važne informacije za stanare.</p>
        </div>
      </div>

      <ObavestenjeForm />
    </div>
  );
}

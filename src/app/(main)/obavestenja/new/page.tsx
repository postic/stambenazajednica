import { notFound } from "next/navigation";
import ObavestenjeForm from "./ObavestenjeForm";
import { getObavestenje, Obavestenje } from "@/lib/kvar";
import BackButton from "@/components/BackButton";

export default function NewObavestenjePage() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4">
        <BackButton />
      </div>

      <h1 className="text-base uppercase tracking-wide font-semibold mb-6 text-slate-700">
        Novo Obaveštenje
      </h1>

      <ObavestenjeForm />
    </div>
  );
}
ss

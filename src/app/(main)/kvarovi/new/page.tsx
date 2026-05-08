import { notFound } from "next/navigation";
import KvarForm from "./KvarForm";
import type { Kvar } from "@/types/kvar";
import { getKvar, getFieldOptions } from "@/lib/kvar";

export default function NewKvarPage() {
  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            Prijava novog kvara
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Unesite detalje i prijavite problem stambenoj zajednici.</p>
        </div>
      </div>

      <KvarForm />
    </div>
  );
}

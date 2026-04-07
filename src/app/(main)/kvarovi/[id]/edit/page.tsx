import { notFound } from "next/navigation";
import KvarForm from "./KvarForm";
import { getKvar, Kvar, getFieldOptions } from "@/lib/kvar";
import BackButton from "@/components/BackButton";

interface Option {
  value: string;
  label: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Kvar - Komšija App",
};

export default async function EditKvarPage({ params }: PageProps) {
  const { id } = await params;

  // 1️⃣ kvar
  const kvar: Kvar | null = await getKvar(id);
  if (!kvar) return notFound();

  // 2️⃣ OPCIJE IZ DRUPALA 🔥
  const [statusOptions, prioritetOptions] = await Promise.all([
    getFieldOptions("field_status_kvara"),
    getFieldOptions("field_prioritet_kvara"),
  ]);

  // 🔥 fallback (da UI nikad ne pukne)
  const safeStatus =
    statusOptions.length > 0
      ? statusOptions
      : [
          { value: "prijavljen", label: "Prijavljen" },
          { value: "u_obradi", label: "U obradi" },
          { value: "na_cekanju", label: "Na čekanju" },
          { value: "resen", label: "Rešen" },
        ];

  const safePriority =
    prioritetOptions.length > 0
      ? prioritetOptions
      : [
          { value: "nizak", label: "Nizak" },
          { value: "srednji", label: "Srednji" },
          { value: "visok", label: "Visok" },
          { value: "hitno", label: "Hitno" },

        ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4">
        <BackButton />
      </div>

      <h1 className="text-base uppercase tracking-wide font-semibold mb-6 text-slate-700">
        Edit Kvar
      </h1>

      <KvarForm
        kvar={kvar}
        prioritetOptions={safePriority}
        statusOptions={safeStatus}
      />
    </div>
  );
}

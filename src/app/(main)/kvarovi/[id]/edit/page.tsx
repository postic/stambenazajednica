import { notFound } from "next/navigation";
import KvarForm from "./KvarForm";
import BackButton from "@/components/BackButton";
import { getKvar, getFieldOptions } from "@/lib/kvar";
import type { Kvar } from "@/types/kvar";

interface Option {
  value: string;
  label: string;
}

// ✅ Params je Promise u latest Next.js App Router
interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Kvar - Komšija App",
};

export default async function EditKvarPage({ params }: PageProps) {
  // ✅ Unwrap Promise odmah
  const { id } = await params;

  // 1️⃣ Fetch kvara
  const kvar: Kvar | null = await getKvar(id);
  if (!kvar) return notFound();

  // 2️⃣ Fetch opcija iz Drupala sa catch fallback
  const [statusOptions, prioritetOptions] = await Promise.all([
    getFieldOptions("field_status_kvara").catch(() => []),
    getFieldOptions("field_prioritet_kvara").catch(() => []),
  ]);

  // 3️⃣ Fallback opcije da UI nikad ne pukne
  const safeStatus: Option[] =
    statusOptions.length > 0
      ? statusOptions
      : [
          { value: "prijavljen", label: "Prijavljen" },
          { value: "u_obradi", label: "U obradi" },
          { value: "na_cekanju", label: "Na čekanju" },
          { value: "resen", label: "Rešen" },
        ];

  const safePriority: Option[] =
    prioritetOptions.length > 0
      ? prioritetOptions
      : [
          { value: "nizak", label: "Nizak" },
          { value: "srednji", label: "Srednji" },
          { value: "visok", label: "Visok" },
          { value: "hitno", label: "Hitno" },
        ];

  // 4️⃣ Render forme
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

// src/app/(main)/kvarovi/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import KvarForm from "./KvarForm";
import { getKvar, Kvar } from "@/lib/kvar";
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

// server-side fetch allowed values iz Drupala
async function getKvarOptions(): Promise<{ prioritet: Option[]; status: Option[] }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/kvar/options`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("Failed to fetch options");
    return res.json();
  } catch (err) {
    console.error("Failed to fetch Kvar options:", err);
    return { prioritet: [], status: [] };
  }
}

export default async function EditKvarPage({ params }: PageProps) {
  const { id } = await params;

  // 1️⃣ fetch kvar
  const kvar: Kvar | null = await getKvar(id);
  if (!kvar) return notFound();

  // 2️⃣ fetch opcije iz Drupala
  const options = await getKvarOptions();

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* 🔙 BACK BUTTON */}
      <div className="mb-4">
        <BackButton />
      </div>

      {/* 🔹 PAGE TITLE */}
      <h1 className="text-base uppercase tracking-wide font-semibold mb-6 text-slate-700">
        Edit Kvar
      </h1>

      {/* 🔹 FORM */}
      <KvarForm
        kvar={kvar}
        prioritetOptions={options.prioritet}
        statusOptions={options.status}
      />
    </div>
  );
}

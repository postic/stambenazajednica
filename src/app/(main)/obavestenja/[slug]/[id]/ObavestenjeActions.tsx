"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteObavestenje } from "@/lib/obavestenje";

interface ObavestenjeActionsProps {
  slug: string;
  id: string;
}

export default function ObavestenjeActions({
  slug,
  id,
}: ObavestenjeActionsProps) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Da li ste sigurni da želite da obrišete ovo obaveštenje?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await deleteObavestenje(slug, id);

      toast.success(
        "Obaveštenje je uspešno obrisano."
      );

      router.push("/obavestenja");
      router.refresh();
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Greška pri brisanju obaveštenja"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() =>
          router.push(
            `/obavestenja/${slug}/${id}/izmeni`
          )
        }
        disabled={deleting}
        className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
      >
        Izmeni
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {deleting ? "Brisanje..." : "Obriši"}
      </button>
    </div>
  );
}

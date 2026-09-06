"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  fetchObavestenje,
  updateObavestenje,
} from "@/lib/obavestenje";

export default function ObavestenjeEditForm({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const obavestenje =
          await fetchObavestenje(id);

        setTitle(obavestenje.title);
        setBody(obavestenje.body);
      } catch (error: any) {
        toast.error(
          error.message ||
            "Greška pri učitavanju obaveštenja"
        );

        router.push("/obavestenja");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(
        "Naslov obaveštenja je obavezan"
      );
      return;
    }

    if (!body.trim()) {
      toast.error(
        "Tekst obaveštenja je obavezan"
      );
      return;
    }

    setSaving(true);

    try {
      await updateObavestenje({
        id,
        title: title.trim(),
        body: body.trim(),
        created: "",
      });

      toast.success(
        "Obaveštenje je uspešno izmenjeno."
      );

      router.push(
        `/obavestenja/${id}`
      );

      router.refresh();
    } catch (error: any) {
      toast.error(
        error.message ||
          "Greška pri izmeni obaveštenja"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-500">
        Učitavanje...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Naslov
        </label>

        <input
          type="text"
          value={title}
          required
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-primary bg-transparent"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Opis
        </label>

        <textarea
          value={body}
          required
          onChange={(e) =>
            setBody(e.target.value)
          }
          rows={6}
          className="w-full border-b py-2 outline-none resize-none border-slate-300 focus:border-primary bg-transparent"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving
            ? "Čuvanje..."
            : "Sačuvaj"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() =>
            router.push(
              `/obavestenja/${id}`
            )
          }
          className="border border-slate-300 text-slate-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Otkaži
        </button>
      </div>
    </form>
  );
}

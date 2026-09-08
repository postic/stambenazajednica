"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createObavestenje } from "@/lib/obavestenje";

type TipObavestenja = {
  id: string;
  naziv: string;
};

export default function ObavestenjeForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kategorija, setKategorija] = useState("");

  const [tipovi, setTipovi] = useState<TipObavestenja[]>([]);
  const [loadingTipovi, setLoadingTipovi] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Učitavanje tipova obaveštenja iz Drupala
  useEffect(() => {
    let ignore = false;

    fetch("/api/obavestenja/tipovi")
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Greška pri učitavanju tipova obaveštenja"
          );
        }

        return res.json();
      })
      .then((data) => {
        if (ignore) return;

        setTipovi(data.data ?? []);
      })
      .catch((err) => {
        if (ignore) return;

        console.error(err);
        toast.error(
          "Nije moguće učitati tipove obaveštenja"
        );

        setTipovi([]);
      })
      .finally(() => {
        if (!ignore) {
          setLoadingTipovi(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await createObavestenje({
        title,
        description,
        kategorija,
      });

      toast.success(
        "Obaveštenje je uspešno kreirano!"
      );

      router.push("/obavestenja");
    } catch (err: any) {
      toast.error(
        err.message ||
          "Greška prilikom kreiranja obaveštenja"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* NASLOV */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Naslov
        </label>

        <input
          type="text"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* TIP OBAVEŠTENJA */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Tip obaveštenja
        </label>

        <select
          value={kategorija}
          required
          disabled={loadingTipovi}
          onChange={(e) => setKategorija(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent disabled:opacity-50"
        >
          <option value="">
            {loadingTipovi
              ? "Učitavanje..."
              : "Izaberi tip obaveštenja"}
          </option>

          {tipovi.map((tip) => (
            <option key={tip.id} value={tip.id}>
              {tip.naziv}
            </option>
          ))}
        </select>
      </div>

      {/* TEKST */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Tekst obaveštenja
        </label>

        <textarea
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full border-b py-2 outline-none resize-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* DUGME */}
      <button
        type="submit"
        disabled={loading || loadingTipovi}
        className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Šaljem..." : "Sačuvaj"}
      </button>
    </form>
  );
}

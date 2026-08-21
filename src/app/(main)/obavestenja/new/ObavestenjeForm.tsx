"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createObavestenje } from "@/lib/obavestenje";

export default function ObavestenjeForm() {

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Next.js router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createObavestenje({ title, body });
      toast.success("Obavestenje je uspešno kreirano!");
      router.push("/obavestenja");
    } catch (err: any) {
      toast.error(err.message || "Greška prilikom kreiranja obavestenja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Naslov</label>
        <input
          type="text"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Opis</label>
        <textarea
          value={body}
          required
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="w-full border-b py-2 outline-none resize-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary disabled:opacity-50"
      >
        {loading ? "Šaljem..." : "Sačuvaj"}
      </button>
    </form>
  );
}

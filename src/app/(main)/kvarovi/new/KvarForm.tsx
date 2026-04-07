"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createKvar } from "@/lib/kvar";

export default function KvarForm() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Next.js router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createKvar({ title, description });
      toast.success("Kvar je uspešno kreiran!");
      router.push("/kvarovi");
    } catch (err: any) {
      toast.error(err.message || "Greška prilikom kreiranja kvara");
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
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Opis</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border-b py-2 outline-none resize-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Prioritet</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        >

        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        >

        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Šaljem..." : "Save"}
      </button>
    </form>
  );
}

// src/app/(main)/kvarovi/[id]/edit/KvarForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Option {
  value: string;
  label: string;
}

export interface Kvar {
  id: string;              // UUID node-a
  title: string;
  description: string;
  priority: string;         // vrednost mora odgovarati field_option
  status: string;           // vrednost mora odgovarati field_option
}

interface Props {
  kvar: Kvar;
  prioritetOptions: Option[];
  statusOptions: Option[];
}

export default function KvarForm({ kvar, prioritetOptions, statusOptions }: Props) {
  const [title, setTitle] = useState(kvar.title || "");
  const [description, setDescription] = useState(kvar.description || "");
  const [priority, setPriority] = useState(kvar.priority || "");
  const [status, setStatus] = useState(kvar.status || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Next.js router

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const username = process.env.DRUPAL_USER!;
    const password = process.env.DRUPAL_PASS!;
    const auth = "Basic " + btoa(`${username}:${password}`);

    // ⚠️ Važno: šaljemo tačne vrednosti iz allowed options
    const payload = {
      data: {
        id: kvar.id,
        type: "node--kvar",
        attributes: {
          title,
          body: {
            value: description,
            format: "plain_text",
          },
          field_prioritet_kvara: priority, // vrednost mora biti tačno iz prioritetOptions.value
          field_status_kvara: status,      // vrednost mora biti tačno iz statusOptions.value
        },
      },
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/kvar/${kvar.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/vnd.api+json",
          "Authorization": auth,
          "Accept": "application/vnd.api+json",
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await res.text();
    //console.log("Drupal response:", res.status, text);

    if (!res.ok) {
      toast.error(`Greška pri update-u! Status: ${res.status}\n${text}`);
    } else {
      toast.success("Kvar uspešno ažuriran!");
      setTimeout(() => {
        router.push(`/kvarovi`); // ili `/kvarovi` za listu svih kvarova
      }, 1500);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    toast.error("Greška pri update-u!");
  } finally {
    setLoading(false);
  }
};

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
          value={description}
          required
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
          required
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        >
          {prioritetOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Status</label>
        <select
          value={status}
          required
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

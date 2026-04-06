// src/app/(main)/kvarovi/[id]/edit/KvarForm.tsx
"use client"; // OBAVEZNO za useState
import { useState } from "react";
import { Kvar } from "@/lib/kvar";

interface Option {
  value: string;
  label: string;
}

export default function KvarForm({
  kvar,
  prioritetOptions,
  statusOptions,
}: {
  kvar: Kvar;
  prioritetOptions: Option[];
  statusOptions: Option[];
}) {
  const [title, setTitle] = useState(kvar.title || "");
  const [description, setDescription] = useState(kvar.description || "");
  const [priority, setPriority] = useState(kvar.priority || "");
  const [status, setStatus] = useState(kvar.status || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: update kvar u Drupalu preko API-ja
    console.log({ title, description, priority, status });
    // Ovde možeš dodati toast notifikaciju za uspešan update
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Title */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border-b py-2 outline-none resize-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm text-slate-600 mb-1">Priority</label>
        <select
          value={priority}
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
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Save
      </button>
    </form>
  );
}

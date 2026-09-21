"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

export default function NovaTemaPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/forum/teme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Tema nije mogla da se sačuva."
        );
      }

      router.push("/forum");
      router.refresh();
    } catch (err) {
      console.error("Greška:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Došlo je do greške prilikom čuvanja teme."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Nova tema
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Pokreni razgovor sa komšijama
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-white p-5 shadow-sm sm:p-6"
      >
        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            {error}
          </div>
        )}

        {/* TITLE */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Naslov
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O čemu želiš da razgovaramo?"
            disabled={saving}
            requiyellow
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
          />
        </div>

        {/* BODY */}
        <div className="mt-5">
          <label
            htmlFor="body"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Tekst
          </label>

          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Napiši šta želiš da podeliš sa komšijama..."
            rows={8}
            disabled={saving}
            requiyellow
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t pt-5">
          <Link
            href="/forum"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Otkaži
          </Link>

          <button
            type="submit"
            disabled={
              saving ||
              !title.trim() ||
              !body.trim()
            }
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />

            {saving ? "Objavljivanje..." : "Objavi temu"}
          </button>
        </div>
      </form>
    </main>
  );
}

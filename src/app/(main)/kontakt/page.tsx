"use client";

import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";

export default function KontaktPage() {
  const [form, setForm] = useState({
    ime: "",
    email: "",
    predmet: "",
    poruka: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        "/api/kontakt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Poruka nije poslata."
        );
      }

      setSuccess(
        "Vaša poruka je uspešno poslata."
      );

      setForm({
        ime: "",
        email: "",
        predmet: "",
        poruka: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Došlo je do greške pri slanju poruke."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* HEADER */}

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">
            Kontakt
          </h1>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Imate pitanje, predlog ili želite da
          kontaktirate upravnika? Pošaljite poruku
          putem kontakt forme.
        </p>
      </div>

      {/* FORM */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* IME */}

          <div>
            <label
              htmlFor="ime"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Ime i prezime
            </label>

            <input
              id="ime"
              name="ime"
              type="text"
              value={form.ime}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Unesite ime i prezime"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="vas@email.com"
            />
          </div>

          {/* PREDMET */}

          <div>
            <label
              htmlFor="predmet"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Predmet
            </label>

            <input
              id="predmet"
              name="predmet"
              type="text"
              value={form.predmet}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Predmet poruke"
            />
          </div>

          {/* PORUKA */}

          <div>
            <label
              htmlFor="poruka"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Poruka
            </label>

            <textarea
              id="poruka"
              name="poruka"
              value={form.poruka}
              onChange={handleChange}
              required
              rows={7}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Unesite svoju poruku..."
            />
          </div>

          {/* SUCCESS */}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />

              {loading
                ? "Slanje..."
                : "Pošalji poruku"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

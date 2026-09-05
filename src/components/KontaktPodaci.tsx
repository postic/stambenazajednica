"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function KontaktPodaci() {
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadKontaktPodaci() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/podesavanja/kontakt",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Greška pri učitavanju kontakt podataka."
          );
        }

        setEmail(
          result?.data?.field_prostor_email ?? ""
        );

        setTelefon(
          result?.data?.field_prostor_telefon ?? ""
        );
      } catch (err) {
        console.error(
          "KontaktPodaci GET greška:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Greška pri učitavanju podataka."
        );
      } finally {
        setLoading(false);
      }
    }

    loadKontaktPodaci();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/podesavanja/kontakt",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            field_prostor_email: email.trim(),
            field_prostor_telefon: telefon.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Greška pri čuvanju kontakt podataka."
        );
      }

      if (
        result?.data?.field_prostor_email !==
        undefined
      ) {
        setEmail(
          result.data.field_prostor_email ?? ""
        );
      }

      if (
        result?.data?.field_prostor_telefon !==
        undefined
      ) {
        setTelefon(
          result.data.field_prostor_telefon ?? ""
        );
      }

      setEditing(false);

      toast.success(
        "Kontakt podaci su sačuvani."
      );
    } catch (err) {
      console.error(
        "KontaktPodaci PATCH greška:",
        err
      );

      toast.error(
        err instanceof Error
          ? err.message
          : "Greška pri čuvanju podataka."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}

      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Kontakt podaci
          </h2>

          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Email i telefon za kontakt.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
          >
            Izmeni
          </button>
        )}
      </div>

      {/* FORM */}

      {editing && (
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* EMAIL */}

            <div>
              <label
                htmlFor="prostor-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="prostor-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="korisnik@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ff6a00] focus:bg-white focus:ring-1 focus:ring-[#ff6a00]"
              />
            </div>

            {/* TELEFON */}

            <div>
              <label
                htmlFor="prostor-telefon"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Telefon
              </label>

              <input
                id="prostor-telefon"
                type="tel"
                value={telefon}
                onChange={(event) =>
                  setTelefon(event.target.value)
                }
                placeholder="+381 64 123 456"
                autoComplete="tel"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ff6a00] focus:bg-white focus:ring-1 focus:ring-[#ff6a00]"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Čuvanje..."
                : "Sačuvaj"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              disabled={saving}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:text-slate-900 disabled:opacity-50"
            >
              Otkaži
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

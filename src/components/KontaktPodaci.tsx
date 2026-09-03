"use client";

import { useEffect, useState } from "react";

interface KontaktPodaciResponse {
  success?: boolean;

  data?: {
    id?: string;
    field_prostor_email?: string | null;
    field_prostor_telefon?: string | null;
  };

  error?: string;
}

export default function KontaktPodaci() {
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
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

        const result =
          await response.json();

        console.log(
          "KONTAKT API CEO ODGOVOR:",
          result
        );

        console.log(
          "KONTAKT API DATA:",
          result?.data
        );

        console.log(
          "EMAIL IZ API:",
          result?.data?.field_prostor_email
        );

        console.log(
          "TELEFON IZ API:",
          result?.data?.field_prostor_telefon
        );

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Greška pri učitavanju kontakt podataka."
          );
        }

        /*
         * Uzimamo vrednosti direktno iz API odgovora.
         */

        const apiEmail =
          result?.data?.field_prostor_email;

        const apiTelefon =
          result?.data?.field_prostor_telefon;

        console.log(
          "POSTAVLJAM EMAIL STATE:",
          apiEmail
        );

        console.log(
          "POSTAVLJAM TELEFON STATE:",
          apiTelefon
        );

        setEmail(
          apiEmail !== null &&
          apiEmail !== undefined
            ? String(apiEmail)
            : ""
        );

        setTelefon(
          apiTelefon !== null &&
          apiTelefon !== undefined
            ? String(apiTelefon)
            : ""
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

  /*
   * DEBUG
   */
  useEffect(() => {
    console.log(
      "REACT EMAIL STATE:",
      email
    );

    console.log(
      "REACT TELEFON STATE:",
      telefon
    );
  }, [email, telefon]);

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      console.log(
        "ŠALJEM EMAIL:",
        email
      );

      console.log(
        "ŠALJEM TELEFON:",
        telefon
      );

      const response = await fetch(
        "/api/podesavanja/kontakt",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            field_prostor_email:
              email.trim(),

            field_prostor_telefon:
              telefon.trim(),
          }),
        }
      );

      const result =
        await response.json();

      console.log(
        "PATCH ODGOVOR:",
        result
      );

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
          result.data.field_prostor_email ??
            ""
        );
      }

      if (
        result?.data?.field_prostor_telefon !==
        undefined
      ) {
        setTelefon(
          result.data.field_prostor_telefon ??
            ""
        );
      }

      setMessage(
        "Kontakt podaci su sačuvani."
      );
    } catch (err) {
      console.error(
        "KontaktPodaci PATCH greška:",
        err
      );

      setError(
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <div className="mb-2 h-4 w-12 animate-pulse rounded bg-slate-100" />

          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
        </div>

        <div>
          <div className="mb-2 h-4 w-14 animate-pulse rounded bg-slate-100" />

          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

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
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            placeholder="korisnik@email.com"
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ff6a00] focus:ring-1 focus:ring-[#ff6a00]"
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
            name="telefon"
            type="tel"
            value={telefon}
            onChange={(event) => {
              setTelefon(event.target.value);
            }}
            placeholder="+381 64 123 456"
            autoComplete="tel"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ff6a00] focus:ring-1 focus:ring-[#ff6a00]"
          />
        </div>
      </div>

      {/* PORUKA */}

      {message && (
        <p className="text-sm text-green-600">
          {message}
        </p>
      )}

      {/* GREŠKA */}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* DUGME */}

      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Čuvanje..."
            : "Sačuvaj izmene"}
        </button>
      </div>
    </div>
  );
}

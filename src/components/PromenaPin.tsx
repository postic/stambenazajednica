"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function PromenaPin() {
  const [trenutniPin, setTrenutniPin] = useState("");
  const [noviPin, setNoviPin] = useState("");
  const [potvrdaPin, setPotvrdaPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // =====================================================
    // PROVERA POLJA
    // =====================================================

    if (
      !trenutniPin ||
      !noviPin ||
      !potvrdaPin
    ) {
      toast.error(
        "Molimo popunite sva polja."
      );
      return;
    }

    // =====================================================
    // DUŽINA PIN-a
    // =====================================================

    if (trenutniPin.length !== 4) {
      toast.error(
        "Trenutni PIN mora imati 4 karaktera."
      );
      return;
    }

    if (noviPin.length !== 4) {
      toast.error(
        "Novi PIN mora imati 4 karaktera."
      );
      return;
    }

    if (potvrdaPin.length !== 4) {
      toast.error(
        "Potvrda PIN-a mora imati 4 karaktera."
      );
      return;
    }

    // =====================================================
    // DOZVOLJENI KARAKTERI
    // =====================================================

    if (
      !/^[a-zA-Z0-9]+$/.test(
        trenutniPin
      )
    ) {
      toast.error(
        "PIN može sadržati samo slova i brojeve."
      );
      return;
    }

    if (
      !/^[a-zA-Z0-9]+$/.test(
        noviPin
      )
    ) {
      toast.error(
        "PIN može sadržati samo slova i brojeve."
      );
      return;
    }

    if (
      !/^[a-zA-Z0-9]+$/.test(
        potvrdaPin
      )
    ) {
      toast.error(
        "PIN može sadržati samo slova i brojeve."
      );
      return;
    }

    // =====================================================
    // PROVERA NOVOG PIN-a
    // =====================================================

    if (noviPin !== potvrdaPin) {
      toast.error(
        "Novi PIN i potvrda PIN-a se ne podudaraju."
      );
      return;
    }

    // =====================================================
    // NOVI PIN MORA BITI DRUGAČIJI
    // =====================================================

    if (trenutniPin === noviPin) {
      toast.error(
        "Novi PIN mora biti drugačiji od trenutnog."
      );
      return;
    }

    // =====================================================
    // SAVE
    // =====================================================

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/change-pin",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            trenutniPin,
            noviPin,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Promena PIN-a nije uspela."
        );
      }

      // ===================================================
      // SUCCESS
      // ===================================================

      toast.success(
        "PIN je uspešno promenjen."
      );

      setTrenutniPin("");
      setNoviPin("");
      setPotvrdaPin("");

      setEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Došlo je do greške."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-slate-900">
            PIN
          </h2>

          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Promenite PIN koji koristite za prijavu na svoj nalog.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() =>
              setEditing(true)
            }
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Izmeni
          </button>
        )}
      </div>

      {/* ===================================================
          FORM
      =================================================== */}

      {editing && (
        <form
          onSubmit={handleSubmit}
          className="mt-6"
        >
          {/* =================================================
              PIN POLJA
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* TRENUTNI PIN */}

            <div>
              <label
                htmlFor="trenutniPin"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Trenutni PIN
              </label>

              <input
                id="trenutniPin"
                type="password"
                inputMode="text"
                maxLength={4}
                autoComplete="current-password"
                value={trenutniPin}
                onChange={(e) =>
                  setTrenutniPin(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base tracking-[0.3em] text-slate-900 outline-none transition focus:border-[#ff6a00] focus:bg-white focus:ring-1 focus:ring-[#ff6a00]"
              />
            </div>

            {/* NOVI PIN */}

            <div>
              <label
                htmlFor="noviPin"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Novi PIN
              </label>

              <input
                id="noviPin"
                type="password"
                inputMode="text"
                maxLength={4}
                autoComplete="new-password"
                value={noviPin}
                onChange={(e) =>
                  setNoviPin(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base tracking-[0.3em] text-slate-900 outline-none transition focus:border-[#ff6a00] focus:bg-white focus:ring-1 focus:ring-[#ff6a00]"
              />
            </div>

            {/* POTVRDA NOVOG PIN-a */}

            <div>
              <label
                htmlFor="potvrdaPin"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Potvrdite novi PIN
              </label>

              <input
                id="potvrdaPin"
                type="password"
                inputMode="text"
                maxLength={4}
                autoComplete="new-password"
                value={potvrdaPin}
                onChange={(e) =>
                  setPotvrdaPin(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base tracking-[0.3em] text-slate-900 outline-none transition focus:border-[#ff6a00] focus:bg-white focus:ring-1 focus:ring-[#ff6a00]"
              />
            </div>
          </div>

          {/* =================================================
              DUGMAD
          ================================================= */}

          <div className="mt-5 flex items-center gap-3">
            {/* PROMENI PIN */}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Čuvanje..."
                : "Promeni PIN"}
            </button>

            {/* OTKAŽI */}

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setEditing(false);

                setTrenutniPin("");
                setNoviPin("");
                setPotvrdaPin("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Otkaži
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

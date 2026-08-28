import AllowNotifications from "@/components/AllowNotifications";

export default function PodesavanjePage() {
  return (
    <div className="space-y-8">
      {/* ==========================================
          NASLOV
          ========================================== */}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Podešavanja
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Upravljaj podešavanjima svog prostora i
          korisničkog naloga.
        </p>
      </div>

      {/* ==========================================
          NOTIFIKACIJE
          ========================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Push obaveštenja
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Uključi push obaveštenja kako bi primao
            važne informacije direktno na ovom uređaju.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <AllowNotifications />
        </div>
      </section>

      {/* ==========================================
          ŠIFRA NA VRATIMA
          ========================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Šifra na vratima
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Podesi šifru koju koristiš za ulazak u objekat.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <button
            type="button"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Podesi šifru
          </button>
        </div>
      </section>

    </div>
  );
}

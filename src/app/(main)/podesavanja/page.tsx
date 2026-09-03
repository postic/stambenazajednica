import AllowNotifications from "@/components/AllowNotifications";
import KontaktPodaci from "@/components/KontaktPodaci";

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
          KONTAKT PODACI
          ========================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Kontakt podaci
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Unesi email adresu i broj telefona na koji možemo
            da te kontaktiramo.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <KontaktPodaci />
        </div>
      </section>

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

    </div>
  );
}

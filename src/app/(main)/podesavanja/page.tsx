import AllowNotifications from "@/components/AllowNotifications";
import KontaktPodaci from "@/components/KontaktPodaci";

export default function PodesavanjePage() {
  return (
    <div className="max-w-4xl">
      {/* ==========================================
          NASLOV
          ========================================== */}

      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            Podešavanja
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Upravljajte podešavanjima svog prostora i korisničkog naloga.</p>
        </div>
      </div>

      {/* ==========================================
          NOTIFIKACIJE
          ========================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 mb-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">
            Push obaveštenja
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Uključite push obaveštenja kako biste primali
            važne informacije direktno na ovom uređaju.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <AllowNotifications />
        </div>
      </section>

      {/* ==========================================
          KONTAKT PODACI
          ========================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 mb-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">
            Kontakt podaci
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Unesite email adresu i broj telefona na koji možemo
            da Vas kontaktiramo.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <KontaktPodaci />
        </div>
      </section>

    </div>
  );
}

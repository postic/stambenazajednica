"use client";

export default function InfoPage() {
  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            Pomoć i uputstvo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sve važne informacije na jednom mestu</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="space-y-1">

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              O aplikaciji
            </h2>

            <p className="text-sm leading-6 text-slate-500">
              Aplikacija omogućava stanarima da na jednom mestu
              dobijaju važne informacije, obaveštenja i učestvuju
              u anketama.
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              Obaveštenja
            </h2>

            <p className="text-sm leading-6 text-slate-500">
              Uključite obaveštenja kako biste pravovremeno
              dobijali važne informacije.
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              Pomoć
            </h2>

            <p className="text-sm leading-6 text-slate-500">
              Ako imate problem sa korišćenjem aplikacije,
              obratite se administratoru.
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              Moj profil
            </h2>

            <p className="text-sm leading-6 text-slate-500">
              U svom profilu možete uneti ili izmeniti svoje kontakt podatke.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

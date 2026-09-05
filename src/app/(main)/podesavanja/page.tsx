"use client";

import AllowNotifications from "@/components/AllowNotifications";
import KontaktPodaci from "@/components/KontaktPodaci";
import PromenaPin from "@/components/PromenaPin";

export default function PodesavanjaPage() {
  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div data-field>
            <h1 className="text-xl font-semibold">
              Podešavanja
            </h1>

            <p className="mt-1 text-sm text-slate-500">
            Upravljajte svojim podešavanjima.</p>
          </div>
        </div>
      </div>

      {/* SETTINGS */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* OBAVEŠTENJA */}

        <section className="px-5 py-6 sm:px-7">
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-slate-900">
                Obaveštenja
              </h2>

              <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                Uključite obaveštenja kako biste pravovremeno
                dobijali važne informacije.
              </p>
            </div>

            <div className="shrink-0">
              <AllowNotifications />
            </div>
          </div>
        </section>

        <div className="border-t border-slate-100" />

        {/* KONTAKT PODACI */}

        <section className="px-5 py-6 sm:px-7">
          <KontaktPodaci />
        </section>

        <div className="border-t border-slate-100" />

        {/* PIN */}

        <section className="px-5 py-6 sm:px-7">
          <PromenaPin />
        </section>
      </div>
    </div>
  );
}

"use client";

export default function InfoPage() {
  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            Dobro došli
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sve o našem ulazu na jednom mestu
          </p>
        </div>
      </div>

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">

        <h3 className="text-sm font-semibold mb-4 border-b border-gray-300 pb-1">
          O aplikaciji
        </h3>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Komšija je aplikacija namenjena našoj stambenoj zajednici, sa željom da naš ulaz bude lepši, uređeniji i bolje organizovan.
          </p>

          <p className="text-sm text-gray-500">
            Ovde možete na jednom mestu pratiti važne informacije, obaveštenja, radove, uplate i sva dešavanja u našem ulazu.
          </p>

          <p className="text-sm text-gray-500">
            Prijavite se svojim PIN-om i budite u toku sa svim što se dešava. Uključite obaveštenja kako biste na vreme saznali kada se pojavi nešto novo.
          </p>

          <p className="pt-1 text-sm font-medium text-slate-700">
            Komšija – za naš ulaz i lepši zajednički život.
          </p>
        </div>
      </section>

    </div>
  );
}

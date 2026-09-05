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

      <section className="rounded-xl border border-slate-200 bg-white p-6 mb-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">
            O aplikaciji
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Ova aplikacija vam omogućava da na jednostavan način pratite važne informacije, obaveštenja i dešavanja u vašoj zajednici.
            Sve važne informacije možete pronaći na jednom mestu, a uključivanjem obaveštenja možete na vreme saznati kada se objavi nešto novo.
          </p>
        </div>

        <div className="mb-3 border-t border-slate-100 pt-3">
          <h2 className="text-base font-semibold text-slate-900">
            Pomoć
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Ova aplikacija vam omogućava da na jednostavan način pratite važne informacije, obaveštenja i dešavanja u vašoj zajednici.
            Sve važne informacije možete pronaći na jednom mestu, a uključivanjem obaveštenja možete na vreme saznati kada se objavi nešto novo.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <h2 className="text-base font-semibold text-slate-900">
            Uputstvo
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Ova aplikacija vam omogućava da na jednostavan način pratite važne informacije, obaveštenja i dešavanja u vašoj zajednici.
            Sve važne informacije možete pronaći na jednom mestu, a uključivanjem obaveštenja možete na vreme saznati kada se objavi nešto novo.
          </p>
        </div>

      </section>

    </div>
  );
}

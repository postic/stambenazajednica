"use client";

export default function UpravnikPage() {
  return (
    <div className="max-w-5xl">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Pregled
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Pregled stambene zajednice
        </p>
      </div>

      {/* SADRŽAJ */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          Dobrodošli
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Iz menija sa leve strane možete upravljati prostorima,
          stanarima, PIN-ovima i finansijama stambene zajednice.
        </p>
      </div>
    </div>
  );
}

"use client";

export interface Obavestenje {
  id: string;
  title: string;
  body: string;
  created: string;
  slug: string;
  image?: string | null;
}

export default function ObavestenjaList({
  obavestenja = [],
}: {
  obavestenja?: Obavestenje[];
}) {
  if (!Array.isArray(obavestenja) || obavestenja.length === 0) {
    return <p className="text-gray-500 text-center">Nema obaveštenja.</p>;
  }

  const MAX_BODY_CHARS = 80; // maksimalan broj karaktera za prikaz

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {obavestenja.map((o) => (
        <article
          key={o.id}
          className="flex bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[120px]"
        >
          {/* LEVA SLIKA kvadratna i visina ista kao kartica */}
          {o.image && (
            <div className="flex-shrink-0 w-28 h-28 md:w-32 md:h-32">
              <img
                src={o.image}
                alt={o.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* DESNI SADRŽAJ */}
          <div className="flex flex-col justify-center p-4 flex-1">
            <h2 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-1">
              {o.title}
            </h2>

            <time className="text-xs text-slate-500 mb-1">
              {new Date(o.created).toLocaleDateString("sr-RS", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>

            <p className="text-slate-700 mb-1 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
              {o.body.length > MAX_BODY_CHARS
                ? o.body.slice(0, MAX_BODY_CHARS) + "…"
                : o.body}
            </p>

            <span className="text-blue-600 font-medium cursor-pointer text-sm">
              Read more →
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

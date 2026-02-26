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
    return <p className="text-gray-500">Nema obaveštenja.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {obavestenja.map((o) => (
        <article
          key={o.id}
          className="grid grid-cols-1 md:grid-cols-[200px_1fr] bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden"
        >
          {/* LEVA SLIKA */}
          {o.image && (
            <div className="max-h-64 md:max-h-48 w-full overflow-hidden leading-none">
              <img
                src={o.image}
                alt={o.title}
                className="block align-top w-full h-full object-cover"
              />
            </div>
          )}

          {/* DESNI SADRŽAJ */}
          <div className="flex flex-col justify-center p-6 min-h-[160px]">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">{o.title}</h2>

            <time className="text-sm text-slate-500 mb-2">
              {new Date(o.created).toLocaleDateString("sr-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>

            <p className="text-slate-700 mb-3 line-clamp-2">{o.body}</p>

            <span className="text-blue-600 font-medium cursor-pointer">
              Read more →
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

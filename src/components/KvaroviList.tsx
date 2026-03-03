"use client";

import Link from "next/link";
import { htmlToPreview } from "@/lib/text";

export interface Kvarovi {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string | null;
}

export default function KvaroviList({
  kvarovi = [],
}: {
  kvarovi?: Kvarovi[];
}) {
  if (!Array.isArray(kvarovi) || kvarovi.length === 0) {
    return <p className="text-gray-500 text-center">Nema kvarova.</p>;
  }

  const MAX_BODY_CHARS = 100; // maksimalan broj karaktera za prikaz

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {kvarovi.map((o) => (
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
            <h2 className="text-base font-semibold text-slate-900 mb-1 line-clamp-1">
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
              {htmlToPreview(o.body, MAX_BODY_CHARS)}
            </p>

            <Link
              href={`/kvarovi/${o.id}`}
              className="text-blue-600 font-medium text-sm mt-1 inline-block"
            >
              Read more →
            </Link>

          </div>
        </article>
      ))}
    </div>
  );
}

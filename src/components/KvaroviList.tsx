'use client';

import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export interface Kvarovi {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string | null;
  statusName?: string; // naziv statusa iz taxonomy term
}

export default function KvaroviTable({ kvarovi = [] }: { kvarovi?: Kvarovi[] }) {
  if (!Array.isArray(kvarovi) || kvarovi.length === 0) {
    return <p className="text-gray-500 text-center">Nema kvarova.</p>;
  }

  const MAX_BODY_CHARS = 100;

  return (
    <div className="overflow-x-auto max-w-6xl mx-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Naslov</th>
            <th className="px-4 py-2 text-left">Datum</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Detalji</th>
          </tr>
        </thead>
        <tbody>
          {kvarovi.map((o) => (
            <tr key={o.id} className="border-t border-gray-200 hover:bg-gray-50">

              {/* NASLOV */}
              <td className="px-4 py-2 font-medium">{o.title}</td>

              {/* DATUM */}
              <td className="px-4 py-2 text-sm text-gray-500">
                {new Date(o.created).toLocaleDateString("sr-RS", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>

              {/* STATUS */}
              <td className="px-4 py-2">
                <StatusBadge status={o.statusName || "Nepoznat"} />
              </td>

              {/* LINK */}
              <td className="px-4 py-2">
                <Link
                  href={`/kvarovi/${o.id}`}
                  className="text-blue-600 font-medium text-sm hover:underline"
                >
                  Opširnije →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

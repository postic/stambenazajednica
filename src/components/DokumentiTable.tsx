'use client';

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export interface Dokumenti {
  id: string;
  title: string;
  body: string;
  created: string;
  typeName?: string;
}

export default function DokumentiTable({ dokumenti = [] }: { dokumenti?: Dokumenti[] }) {
  if (!Array.isArray(dokumenti) || dokumenti.length === 0) {
    return <p className="text-gray-500 text-center">Nema dokumenata.</p>;
  }

  return (
    <div className="overflow-x-auto max-w-6xl mx-auto">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Naslov</th>
            <th className="px-4 py-2 text-left">Datum</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-center w-32">Akcije</th>
          </tr>
        </thead>

        <tbody>
          {dokumenti.map((o) => (
            <tr
              key={o.id}
              className="border-t border-gray-200 hover:bg-gray-50 transition"
            >
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
                <StatusBadge status={o.typeName || "Nepoznat"} />
              </td>

              {/* AKCIJE */}
              <td className="px-4 py-2">
                <div className="flex justify-center items-center gap-3">

                  {/* VIEW */}
                  <Link
                    href={`/dokumenti/${o.id}`}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600"
                    title="Pregled"
                  >
                    <Eye size={18} />
                  </Link>

                  {/* EDIT */}
                  <Link
                    href={`/dokumenti/${o.id}/edit`}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-green-600"
                    title="Izmeni"
                  >
                    <Pencil size={18} />
                  </Link>

                  {/* DELETE */}
                  <button
                    className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600"
                    title="Obriši"
                    onClick={() => alert("Delete funkcija još nije implementirana")}
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

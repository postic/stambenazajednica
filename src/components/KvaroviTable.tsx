"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export interface Kvarovi {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string | null;
  statusName?: string;
}

export default function KvaroviTable({ kvarovi = [] }: { kvarovi?: Kvarovi[] }) {
  if (!Array.isArray(kvarovi) || kvarovi.length === 0) {
    return <p className="text-gray-500 text-center">Nema kvarova.</p>;
  }

  return (
    <div className="overflow-x-auto max-w-6xl mx-auto">

      {/* DESKTOP TABLE */}
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg hidden md:table">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Naslov</th>
            <th className="px-4 py-2 text-left">Datum</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-center w-32">Akcije</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {kvarovi.map((o) => (
            <tr key={o.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-2 font-medium">{o.title}</td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {new Date(o.created).toLocaleDateString("sr-RS", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-4 py-2"><StatusBadge status={o.statusName || "Nepoznat"} /></td>
              <td className="px-4 py-2">
                <div className="flex justify-center items-center gap-3 whitespace-nowrap">
                  <Link href={`/kvarovi/${o.id}`} className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600"><Eye size={18} /></Link>
                  <Link href={`/kvarovi/${o.id}/edit`} className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-green-600"><Pencil size={18} /></Link>
                  <button className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600" onClick={() => alert("Delete nije implementiran")}><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MOBILE STACKED CARDS */}
      <div className="md:hidden mt-4 space-y-3">
        {kvarovi.map((o) => (
          <div key={o.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{o.title}</span>
              <StatusBadge status={o.statusName || "Nepoznat"} />
            </div>
            <div className="text-sm text-gray-500 mb-2">
              {new Date(o.created).toLocaleDateString("sr-RS", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            {/* IKONE U JEDNOM REDU SA SCROLLOM */}
            <div className="flex gap-3 overflow-x-auto">
              <Link href={`/kvarovi/${o.id}`} className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600"><Eye size={18} /></Link>
              <Link href={`/kvarovi/${o.id}/edit`} className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-green-600"><Pencil size={18} /></Link>
              <button className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600" onClick={() => alert("Delete nije implementiran")}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

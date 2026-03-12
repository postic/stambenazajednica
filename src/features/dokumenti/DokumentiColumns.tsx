// src/features/dokumenti/DokumentiColumns.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

// Tip za jedan dokument
export interface Dokument {
  id: string;
  title: string;
  created: string;
  type?: string;
}

// Funkcija koja poziva delete handler (možeš kasnije povezati sa realnom funkcijom)
const handleDelete = (id: string) => {
  alert(`Delete funkcija nije implementirana za dokument ID: ${id}`);
};

// Definicija kolona za DataTable ili sličnu tabelu
export const dokumentiColumns = [
  {
    key: "title",
    label: "Naslov",
    render: (d: Dokument) => <span>{d.title}</span>,
  },
  {
    key: "date",
    label: "Datum",
    render: (d: Dokument) => (
      <span>
        {new Date(d.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (d: Dokument) => <StatusBadge status={d.type || "Nepoznat"} />,
  },
  {
    key: "actions",
    label: "Akcije",
    render: (d: Dokument) => (
      <div className="flex justify-center items-center gap-3 whitespace-nowrap">
        <Link
          href={`/dokumenti/${d.id}`}
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600"
        >
          <Eye size={18} />
        </Link>
        <Link
          href={`/dokumenti/${d.id}/edit`}
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-green-600"
        >
          <Pencil size={18} />
        </Link>
        <button
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600"
          onClick={() => handleDelete(d.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  },
];

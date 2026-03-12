// src/features/kvarovi/KvaroviColumns.tsx
"use client";

import React from "react";
import { Column } from "@/components/table/DataTable";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

// Tip za jedan kvar
export interface Kvar {
  id: string;
  title: string;
  created: string;
  status?: string; // glavni status kvara
  type?: string;   // dodatni tip kvara
}

// Stub za delete funkciju
const handleDelete = (id: string) => {
  alert(`Delete funkcija nije implementirana za kvar ID: ${id}`);
};

// Funkcija koja bira pravi status
const getStatus = (k: Kvar) => k.status || k.type || "Nepoznat";

// Definicija kolona
export const kvaroviColumns: Column<Kvar>[] = [
  {
    key: "title",
    label: "Naziv kvara",
    render: (k) => <span>{k.title}</span>,
  },
  {
    key: "date",
    label: "Datum prijave",
    render: (k) => (
      <span>
        {new Date(k.created).toLocaleDateString("sr-RS", {
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
    render: (k) => <StatusBadge status={getStatus(k)} />,
  },
  {
    key: "actions",
    label: "Akcije",
    isAction: true, // spaja dugmiće u jedan red na mobile prikazu
    render: (k) => (
      <div className="flex justify-center items-center gap-3 whitespace-nowrap">
        <Link
          href={`/kvarovi/${k.id}`}
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600"
        >
          <Eye size={18} />
        </Link>
        <Link
          href={`/kvarovi/${k.id}/edit`}
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-green-600"
        >
          <Pencil size={18} />
        </Link>
        <button
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600"
          onClick={() => handleDelete(k.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  },
];

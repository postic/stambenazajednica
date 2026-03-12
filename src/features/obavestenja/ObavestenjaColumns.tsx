// src/features/obavestenja/ObavestenjaColumns.tsx
"use client";

import React from "react";
import { Column } from "@/components/table/DataTable";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

// Tip za jedno obaveštenje
export interface Obavestenja {
  id: string;
  title: string;
  created: string;
  type?: string;
}

// Delete stub funkcija
const handleDelete = (id: string) => {
  alert(`Delete funkcija nije implementirana za obaveštenje ID: ${id}`);
};

// Funkcija koja bira pravi status
const getStatus = (o: Obavestenja) => o.type || o.type || "Nepoznat";

// Kolone za DataTable
export const obavestenjaColumns: Column<Obavestenja>[] = [
  {
    key: "title",
    label: "Naslov",
    render: (o) => <span>{o.title}</span>,
  },
  {
    key: "date",
    label: "Datum",
    render: (o) => (
      <span>
        {new Date(o.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    key: "type",
    label: "Tip",
    render: (o) => <StatusBadge status={getStatus(o)} />,
  },
  {
    key: "actions",
    label: "Akcije",
    isAction: true, // spaja dugmiće u jedan red na mobile prikazu
    render: (o) => (
      <div className="flex justify-center items-center gap-3 whitespace-nowrap">
        <Link
          href={`/obavestenja/${o.id}`}
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600"
        >
          <Eye size={18} />
        </Link>
        <Link
          href={`/obavestenja/${o.id}/edit`}
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-green-600"
        >
          <Pencil size={18} />
        </Link>
        <button
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600"
          onClick={() => handleDelete(o.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  },
];

"use client";

import React from "react";
import { Column } from "@/components/table/DataTable";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

// Tip za jednu sednicu
export interface Sednica {
  id: string;
  title: string;
  created: string;
  type?: string;
}

// Delete stub funkcija
const handleDelete = (id: string) => {
  alert(`Delete funkcija nije implementirana za sednicu ID: ${id}`);
};

// Funkcija koja bira pravi status
const getStatus = (s: Sednica) => s.type || "Nepoznat";

// Kolone za DataTable
export const sedniceColumns: Column<Sednica>[] = [
  {
    key: "title",
    label: "Naslov",
    render: (s) => <span>{s.title}</span>,
  },
  {
    key: "date",
    label: "Datum",
    render: (s) => (
      <span>
        {new Date(s.created).toLocaleDateString("sr-RS", {
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
    render: (s) => <StatusBadge status={getStatus(s)} />,
  },
  {
    key: "actions",
    label: "Akcije",
    isAction: true, // spaja dugmiće u jedan red na mobile prikazu
    render: (s) => (
      <div className="flex justify-center items-center gap-3 whitespace-nowrap">
        <Link
          href={`/sednice/${s.id}`}
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600"
        >
          <Eye size={18} />
        </Link>
        <Link
          href={`/sednice/${s.id}/edit`}
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-green-600"
        >
          <Pencil size={18} />
        </Link>
        <button
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600"
          onClick={() => handleDelete(s.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  },
];

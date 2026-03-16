"use client";

import { Column } from "@/components/table/DataTable";
import { Sednica } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

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
    header: "Naslov",
    render: (s) => (
      <Link
        href={`/sednice/${s.id}`}
        className="text-blue-600 hover:underline"
        title={s.title}
      >
        {s.title}
      </Link>
    ),
  },
  {
    key: "created",
    header: "Datum",
    render: (s) =>
      s.created
        ? new Date(s.created).toLocaleDateString("sr-RS", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-",
  },
  {
    key: "type",
    header: "Tip",
    render: (s) => <StatusBadge status={getStatus(s)} />,
  },
  {
    key: "actions",
    header: "Akcije",
    render: (s) => (
      <div className="flex justify-center gap-2">
        <Link
          href={`/sednice/${s.id}`}
          className="text-blue-600 hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </Link>
        <Link
          href={`/sednice/${s.id}/edit`}
          className="text-yellow-600 hover:text-yellow-800"
          title="Edit"
        >
          <FaEdit />
        </Link>
        <button
          className="text-red-600 hover:text-red-800"
          title="Delete"
          onClick={() => handleDelete(s.id)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  },
];

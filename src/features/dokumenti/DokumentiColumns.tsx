"use client";

import { Column } from "@/components/table/DataTable";
import { Dokument } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

// Delete stub funkcija
const handleDelete = (id: string) => {
  alert(`Delete funkcija nije implementirana za dokument ID: ${id}`);
};

// Funkcija koja bira pravi status
const getTip = (d: Dokument) => d.tip || "Nepoznat";

// Kolone za DataTable
export const dokumentiColumns: Column<Dokument>[] = [
  {
    key: "title",
    header: "Naziv",
    render: (d) => (
      <Link
        href={`/dokumenti/${d.id}`}
        className="text-blue-600 hover:underline"
        title={d.title}
      >
        {d.title}
      </Link>
    ),
  },
  {
    key: "created",
    header: "Datum",
    render: (d) =>
      d.created
        ? new Date(d.created).toLocaleDateString("sr-RS", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-",
  },
  {
    key: "type",
    header: "Tip",
    render: (d) =>
      d.type ? (
        <span
          className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
          title={d.type}
        >
          {d.type}
        </span>
      ) : (
        "-"
      ),
  },
  {
    key: "actions",
    header: "Akcije",
    render: (d) => (
      <div className="flex justify-center gap-2">
        <Link
          href={`/dokumenti/${d.id}`}
          className="text-blue-600 hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </Link>
        <Link
          href={`/dokumenti/${d.id}/edit`}
          className="text-yellow-600 hover:text-yellow-800"
          title="Edit"
        >
          <FaEdit />
        </Link>
        <button
          className="text-red-600 hover:text-red-800"
          title="Delete"
          onClick={() => handleDelete(d.id)}
        >
          <FaTrash />
        </button>
      </div>
    ),
  },
];

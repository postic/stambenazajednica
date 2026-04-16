"use client";
import { Column } from "@/components/table/DataTable";
import type { Sednica } from "@/types/sednica";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

// Delete stub funkcija
const handleDelete = (id: string) => {
  alert(`Delete funkcija nije implementirana za sednicu ID: ${id}`);
};

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
    sortable: true,
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
    key: "status",
    header: "Status",
    render: (s) =>
      <StatusBadge status={s.status} />
  },
  {
    key: "actions",
    header: "Akcije",
    width: "90px", // 👈 KLJUČNO
    isAction: true,
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

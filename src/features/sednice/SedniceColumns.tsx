"use client";
import { Column } from "@/components/table/types";
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
        className=" hover:underline"
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
        ? new Date(s.created).toLocaleDateString("sr-Latn-RS", {
            day: "numeric",
            month: "long",
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
];

"use client";
import { Column } from "@/components/table/types";
import type { Projekat } from "@/types/projekat";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

// Delete stub funkcija
const handleDelete = (id: string) => {
  alert(`Delete funkcija nije implementirana za sednicu ID: ${id}`);
};

// Kolone za DataTable
export const projektiColumns: Column<Projekat>[] = [
  {
    key: "title",
    header: "Naslov",
    render: (s) => s.title,
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
    key: "izvodjac",
    header: "Izvođač",
    render: (s) =>
      s.izvodjac
        ? s.izvodjac
        : "-",
  },
  {
    key: "status",
    header: "Status",
    render: (s) =>
      <StatusBadge status={s.status} />
  },
];

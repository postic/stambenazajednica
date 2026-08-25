"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { KategorijaDokumenta } from "@/types/dokument";
import { Column } from "@/components/table/types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import StatusBadge from "@/components/StatusBadge";
import type { Kvar } from "@/types/kvar";

export const kategorijeColumns = [
  {
    key: "name",
    header: "Kategorija",

    render: (row: KategorijaDokumenta) => (
      <Link
        href={`/dokumenti/${row.slug}`}
        className="hover:underline"
        title={row.name}
      >
        {row.name}
      </Link>
    ),
  },

  {
    key: "brojDokumenata",
    header: "Broj dokumenata",
    render: (row: KategorijaDokumenta) =>
      row.brojDokumenata,
  },

];

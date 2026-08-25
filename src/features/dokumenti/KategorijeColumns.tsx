"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { KategorijaDokumenta } from "@/types/dokument";

export const kategorijeColumns = [
  {
    key: "name",
    label: "Kategorija",

    render: (row: KategorijaDokumenta) => (
      <Link
        href={`/dokumenti/${row.slug}`}
        className="font-medium text-slate-900"
      >
        {row.name}
      </Link>
    ),
  },

  {
    key: "brojDokumenata",
    label: "Dokumenata",

    render: (row: KategorijaDokumenta) =>
      row.brojDokumenata,
  },

  {
    key: "actions",
    label: "",

    render: (row: KategorijaDokumenta) => (
      <Link
        href={`/dokumenti/${row.slug}`}
        className="flex justify-end"
      >
        <ChevronRight
          size={18}
          className="text-slate-400"
        />
      </Link>
    ),
  },
];

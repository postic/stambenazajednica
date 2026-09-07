"use client";

import type { Telefon } from "@/types/telefon";
import type { Column } from "@/components/table/types";

export const telefoniColumns: Column<Telefon>[] = [
  {
    key: "naziv",
    header: "Naziv",

    render: (row: Telefon) => (
      <span className="font-medium text-slate-900">
        {row.naziv}
      </span>
    ),
  },

  {
    key: "broj",
    header: "Telefon",

    render: (row: Telefon) => (
      <a
        href={`tel:${row.broj}`}
        className="text-slate-900 hover:underline"
      >
        {row.broj}
      </a>
    ),
  },
];

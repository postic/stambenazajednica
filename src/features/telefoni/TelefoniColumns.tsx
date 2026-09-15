"use client";

import type { Telefon } from "@/types/telefon";
import type { Column } from "@/components/table/types";

export const telefoniColumns: Column<Telefon>[] = [
  {
    key: "naziv",
    header: "Naziv",

    render: (row: Telefon) => (
      {row.naziv}
    ),
  },

  {
    key: "broj",
    header: "Telefon",

    render: (row: Telefon) => row.broj,
  },
];

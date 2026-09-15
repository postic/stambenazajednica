"use client";

import Link from "next/link";

import type { KategorijaTelefona } from "@/types/telefon";
import { Column } from "@/components/table/types";

export const kategorijeColumns: Column<KategorijaTelefona>[] = [
  {
    key: "name",
    header: "Kategorija",

    render: (row: KategorijaTelefona) => row.name,
  },

  {
    key: "brojTelefona",
    header: "Broj telefona",

    render: (row: KategorijaTelefona) => row.brojTelefona,
  },
];

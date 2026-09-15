"use client";

import Link from "next/link";

import type {
  KategorijaObavestenja,
} from "@/types/obavestenje";

export const kategorijeColumns = [
  {
    key: "name",
    header: "Kategorija",
    render: (row: KategorijaObavestenja) => row.name,
  },
  {
    key: "brojObavestenja",
    header: "Broj obaveštenja",

    render: (row: KategorijaObavestenja) =>
      row.brojObavestenja,
  },
];

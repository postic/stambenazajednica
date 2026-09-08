"use client";

import Link from "next/link";

import type {
  Obavestenje,
} from "@/types/obavestenja";

export const obavestenjaColumns = [
  {
    key: "title",
    header: "Obaveštenje",

    render: (row: Obavestenje) => (
      <Link
        href={`/obavestenja/${row.categorySlug}/${row.id}`}
        className="hover:underline"
        title={row.title}
      >
        {row.title}
      </Link>
    ),
  },

  {
    key: "created",
    header: "Datum",

    render: (row: Obavestenje) => {
      if (!row.created) {
        return "";
      }

      return new Date(
        row.created
      ).toLocaleDateString("sr-RS");
    },
  },
];

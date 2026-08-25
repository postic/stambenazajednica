"use client";

import Link from "next/link";
import type { Dokument } from "@/types/dokument";

export const dokumentiColumns = [
  {
    key: "title",
    label: "Dokument",

    render: (row: Dokument) => (
      <Link
        href={`/dokumenti/${row.categorySlug}/${row.id}`}
        className="font-medium text-slate-900"
      >
        {row.title}
      </Link>
    ),
  },

  {
    key: "created",
    label: "Datum",

    render: (row: Dokument) =>
      new Date(row.created).toLocaleDateString(
        "sr-Latn-RS",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ),
  },

  {
    key: "status",
    label: "Status",

    render: (row: Dokument) =>
      row.status,
  },
];

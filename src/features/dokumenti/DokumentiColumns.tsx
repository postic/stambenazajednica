"use client";

import Link from "next/link";
import type { Dokument } from "@/types/dokument";
import StatusBadge from "@/components/StatusBadge";

export const dokumentiColumns = [
  {
    key: "title",
    header: "Dokument",
    render: (row: Dokument) => (
      <Link
        href={`/dokumenti/${row.categorySlug}/${row.id}`}
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
    render: (row: Dokument) =>
      row.created
        ? new Date(row.created).toLocaleDateString(
            "sr-Latn-RS",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )
        : "—",
  },

  {
    key: "status",
    header: "Tip",
    render: (row: Dokument) => (
      <StatusBadge status={row.status ?? undefined} />
    ),
  },
];

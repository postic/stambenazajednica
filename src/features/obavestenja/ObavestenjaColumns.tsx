"use client";

import Link from "next/link";

import type {
  Obavestenje,
} from "@/types/obavestenje";

export const obavestenjaColumns = [
  {
    key: "title",
    header: "Obaveštenje",

    render: (row: Obavestenje) => row.title,
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

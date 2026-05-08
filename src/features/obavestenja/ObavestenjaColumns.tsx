import { Column } from "@/components/table/types";
import type { Obavestenje } from "@/types/obavestenje";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const obavestenjaColumns: Column<Obavestenje>[] = [
  {
    key: "title",
    header: "Naslov",
    render: (o) => (
      <Link
        href={`/obavestenja/${o.id}`}
        className=" hover:underline"
        title={o.title}
      >
        {o.title}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Datum",
    render: (o) =>
      new Date(o.created).toLocaleDateString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
  },
];

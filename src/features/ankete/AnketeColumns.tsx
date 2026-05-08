import { Column } from "@/components/table/types";
import type { Anketa } from "@/types/anketa";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const anketeColumns: Column<Anketa>[] = [
  {
    key: "title",
    header: "Naziv",
    align: "left",
    render: (anketa) => (
      <Link
        href={`/ankete/${anketa.id}`}
        className=" hover:underline"
        title={anketa.title}
      >
        {anketa.title}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Datum",
    render: (anketa) =>
      anketa.created
        ? new Date(anketa.created).toLocaleDateString("sr-Latn-RS", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "-",
  },
  {
    key: "status",
    header: "Status",
    render: (anketa) => <StatusBadge status={anketa.status} />,
  },
];

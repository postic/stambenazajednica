import { Column } from "@/components/table/types";
import type { Anketa } from "@/types/anketa";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const anketeColumns: Column<Anketa>[] = [
  {
    key: "title",
    header: "Naziv",
    width: "40%",
    align: "left",
    render: (anketa) => (
      <Link
        href={`/ankete/${anketa.id}`}
        className="text-blue-600 hover:underline"
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
  {
    key: "actions",
    header: "Akcije",
    width: "90px", // 👈 KLJUČNO
    isAction: true,
    render: (anketa) => (
      <div className="flex justify-center gap-2">
        <Link
          href={`/ankete/${anketa.id}`}
          className="text-blue-600 hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </Link>
        <Link
          href={`/ankete/${anketa.id}/edit`}
          className="text-yellow-600 hover:text-yellow-800"
          title="Edit"
        >
          <FaEdit />
        </Link>
        <button
          className="text-red-600 hover:text-red-800"
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    ),
  },
];

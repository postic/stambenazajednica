import { Column } from "@/components/table/DataTable";
import { Kvar } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const kvaroviColumns: Column<Kvar>[] = [
  {
    key: "title",
    header: "Naziv",
    render: (kvar) => (
      <Link href={`/kvarovi/${kvar.id}`} className="text-blue-600 hover:underline" title={kvar.title}>
        {kvar.title}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Datum",
    render: (kvar) =>
      kvar.created
        ? new Date(kvar.created).toLocaleDateString("sr-RS", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-",
  },
  {
    key: "prioritet",
    header: "Prioritet",
    render: (kvar) => <StatusBadge prioritet={kvar.prioritet} />,
  },
  {
    key: "status",
    header: "Status",
    render: (kvar) => <StatusBadge status={kvar.status} />,
  },
  {
    key: "actions",
    header: "Akcije",
    width: "90px",
    isAction: true,
    render: (kvar) => (
      <div className="flex justify-center gap-2">
        <Link href={`/kvarovi/${kvar.id}`} className="text-blue-600 hover:text-blue-800" title="View">
          <FaEye />
        </Link>
        <Link href={`/kvarovi/${kvar.id}/edit`} className="text-yellow-600 hover:text-yellow-800" title="Edit">
          <FaEdit />
        </Link>
        <button className="text-red-600 hover:text-red-800" title="Delete">
          <FaTrash />
        </button>
      </div>
    ),
  },
];

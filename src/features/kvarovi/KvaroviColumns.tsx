import { Column } from "@/components/table/DataTable";
import { Kvar } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

export const kvaroviColumns: Column<Kvar>[] = [
  {
    key: "title",
    header: "Naziv",
    render: (kvar) => (
      <Link
        href={`/kvarovi/${kvar.id}`}
        className="text-blue-600 hover:underline"
        title={kvar.title}
      >
        {kvar.title}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Datum prijave",
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
    key: "status",
    header: "Status",
    render: (kvar) =>
      kvar.statusName ? (
        <span
          className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
          title={kvar.statusName}
        >
          {kvar.statusName}
        </span>
      ) : (
        "-"
      ),
  },
  {
    key: "actions",
    header: "Akcije",
    render: (kvar) => (
      <div className="flex justify-center gap-2">
        <Link
          href={`/kvarovi/${kvar.id}`}
          className="text-blue-600 hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </Link>
        <Link
          href={`/kvarovi/${kvar.id}/edit`}
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

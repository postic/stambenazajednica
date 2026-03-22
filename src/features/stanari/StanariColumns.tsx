import { Column } from "@/components/table/DataTable";
import { Stanar } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

export const stanariColumns: Column<Stanar>[] = [
  {
    key: "title",
    header: "Naziv",
    width: "50%",
    sortable: true,
    render: (stanar) => (
      <Link
        href={`/stanari/${stanar.id}`}
        className="text-blue-600 hover:underline"
        title={stanar.title}
      >
        {stanar.title}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Datum prijave",
    sortable: true,
    render: (stanar) =>
      stanar.created
        ? new Date(stanar.created).toLocaleDateString("sr-RS", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-",
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (stanar) =>
      stanar.statusName ? (
        <span
          className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
          title={stanar.statusName}
        >
          {stanar.statusName}
        </span>
      ) : (
        "-"
      ),
  },
  {
    key: "actions",
    header: "Akcije",
    width: "90px", // 👈 KLJUČNO
    isAction: true,
    render: (stanar) => (
      <div className="flex justify-center gap-2">
        <Link
          href={`/stanari/${stanar.id}`}
          className="text-blue-600 hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </Link>
        <Link
          href={`/stanari/${stanar.id}/edit`}
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

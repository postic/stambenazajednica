import { Column } from "@/components/table/DataTable";
import { Stanar } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const stanariColumns: Column<Stanar>[] = [
  {
    key: "title",
    header: "Naziv",
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
    render: (stanar) =>
      <StatusBadge status={stanar.status} />
  },
  {
    key: "tip",
    header: "Tip",
    render: (stanar) =>
      <StatusBadge status={stanar.tip} />
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

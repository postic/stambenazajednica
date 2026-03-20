import { Column } from "@/components/table/DataTable";
import { stan } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

export const stanoviColumns: Column<stan>[] = [
  {
    key: "title",
    header: "Naziv",
    sortable: false,
    render: (stan) => (
      <Link
        href={`/stanovi/${stan.id}`}
        className="text-blue-600 hover:underline"
        title={stan.title}
      >
        {stan.title}
      </Link>
    ),
  },
  {
    key: "sprat",
    header: "Sprat",
    sortable: true,
    render: (stan) => (
      <span>{stan.field_sprat ?? "-"}</span>
    )
  },
  {
    key: "porsina",
    header: "Površina",
    sortable: false,
    render: (stan) => (
      <span>
        {stan.field_kvadratura != null
        ? `${Number(stan.field_kvadratura).toLocaleString("sr-RS")} m²`
        : "-"}
      </span>
    )
  },
  {
    key: "actions",
    header: "Akcije",
    render: (stan) => (
      <div className="flex justify-center gap-2">
        <Link
          href={`/stanovi/${stan.id}`}
          className="text-blue-600 hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </Link>
        <Link
          href={`/stanovi/${stan.id}/edit`}
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

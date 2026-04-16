import { Column } from "@/components/table/types";
import type { Telefon } from "@/types/telefon";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const telefoniColumns: Column<Telefon>[] = [
  {
    key: "title",
    header: "Naziv",
    render: (telefon) => (
      <Link href={`/telefoni/${telefon.id}`} className="text-blue-600 hover:underline" title={telefon.title}>
        {telefon.title}
      </Link>
    ),
  },
  {
    key: "actions",
    header: "Akcije",
    width: "90px",
    align: "center",
    isAction: true,
    render: (telefon) => (
      <div className="flex justify-center gap-2">
        <Link href={`/telefoni/${telefon.id}`} className="text-blue-600 hover:text-blue-800" title="View">
          <FaEye />
        </Link>
        <Link href={`/telefoni/${telefon.id}/edit`} className="text-yellow-600 hover:text-yellow-800" title="Edit">
          <FaEdit />
        </Link>
        <button className="text-red-600 hover:text-red-800" title="Delete">
          <FaTrash />
        </button>
      </div>
    ),
  },
];

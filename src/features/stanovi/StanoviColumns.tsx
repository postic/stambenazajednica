import { Column } from "@/components/table/types";
import type { Stan } from "@/types/stan";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

export const stanoviColumns: Column<Stan>[] = [
  {
    key: "title",
    header: "Naziv",
    //width: "50%",
    //sortable: false,
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
    key: "vlasnik",
    header: "Vlasnik",
    render: (stan) => (
      <span>{stan.vlasnik ?? "-"}</span>
    )
  },
  {
    key: "stanari",
    header: "Stanari",
    render: (stan) => (
      <span>{stan.broj_stanara ?? "-"}</span>
    )
  },
  {
    key: "sprat",
    header: "Sprat",
    render: (stan) => (
      <span>{stan.sprat ?? "-"}</span>
    )
  },
  {
    key: "porsina",
    header: "Površina",
    render: (stan) => (
      <span>
        {stan.kvadratura != null
        ? `${Number(stan.kvadratura).toLocaleString("sr-Latn-RS")} m²`
        : "-"}
      </span>
    )
  },
  {
    key: "actions",
    header: "Akcije",
    width: "90px", // 👈 KLJUČNO
    isAction: true,
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

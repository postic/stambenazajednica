import { Column } from "@/components/table/DataTable";
import { Stan } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

export const transakcijeColumns: Column<Stan>[] = [
  {
    key: "title",
    header: "Naziv",
    //width: "50%",
    sortable: false,
    render: (transakcija) => (
      <Link
        href={`/transakcije/${transakcija.id}`}
        className="text-blue-600 hover:underline"
        title={transakcija.title}
      >
        {transakcija.title}
      </Link>
    ),
  },
  {
    key: "sprat",
    header: "Sprat",
    render: (stan) => (
      <span>{stan.sprat ?? "-"}</span>
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
          href={`/transakcije/${transakcija.id}`}
          className="text-blue-600 hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </Link>
        <Link
          href={`/z/${stan.id}/edit`}
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

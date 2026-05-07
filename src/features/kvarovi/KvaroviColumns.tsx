import { Column } from "@/components/table/types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { Kvar } from "@/types/kvar";

export const kvaroviColumns: Column<Kvar>[] = [
  {
    key: "title",
    header: "Naziv",
    //width: "35%",
    render: (kvar) => (
      <Link
        href={`/kvarovi/${kvar.id}`}
        className="hover:underline"
        title={kvar.title}
      >
        {kvar.title}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Datum",
    render: (kvar) =>
      kvar.created
        ? new Date(kvar.created).toLocaleDateString("sr-Latn-RS", {
            day: "numeric",
            month: "long",
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

  // {
  //   key: "actions",
  //   header: "",
  //   align: "center",
  //   width: "90px",
  //   isAction: true,
  //   render: (kvar) => (
  //     <div className="flex justify-center gap-2">
  //       <Link
  //         href={`/kvarovi/${kvar.id}`}
  //         className="hover:text-gray-900"
  //         title="Pregled"
  //       >
  //         <FaEye />
  //       </Link>

  //       <Link
  //         href={`/kvarovi/${kvar.id}/edit`}
  //         className="hover:text-gray-900"
  //         title="Izmeni"
  //       >
  //         <FaEdit />
  //       </Link>

  //       <button
  //         className="hover:text-red-600"
  //         title="Obriši"
  //       >
  //         <FaTrash />
  //       </button>
  //     </div>
  //   ),
  // },
];

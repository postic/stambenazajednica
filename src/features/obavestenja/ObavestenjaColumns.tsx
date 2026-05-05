import { Column } from "@/components/table/types";
import type { Obavestenje } from "@/types/obavestenje";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const obavestenjaColumns: Column<Obavestenje>[] = [
  {
    key: "title",
    header: "Naslov",
    render: (o) => (
      <Link
        href={`/obavestenja/${o.id}`}
        className=" hover:underline"
        title={o.title}
      >
        {o.title}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Datum",
    render: (o) =>
      new Date(o.created).toLocaleDateString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
  },
  {
    key: "actions",
    header: "Akcije",
    width: "90px", // 👈 KLJUČNO
    isAction: true,
    render: (o) => (
      <div className="flex justify-center gap-2">
        <Link
          href={`/obavestenja/${o.id}`}
          className=" hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </Link>
        <Link
          href={`/obavestenja/${o.id}/edit`}
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

import { Column } from "@/components/table/types";
import type { Stanar } from "@/types/stanar";
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
        className=" hover:underline"
        title={stanar.title}
      >
        {stanar.title}
      </Link>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (stanar) =>
      <StatusBadge status={stanar.status ? "aktivan" : "pasivan"} />
  },
  {
    key: "tip",
    header: "Tip",
    render: (stanar) =>
      <StatusBadge status={stanar.tip ? "podstanar" : "stanar"} />
  },
];

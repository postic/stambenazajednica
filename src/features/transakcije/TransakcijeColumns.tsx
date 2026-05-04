import { Column } from "@/components/table/types";
import type { TransakcijaWithBalance } from "@/types/transakcija";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatRSD } from "@/lib/text";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export const transakcijeColumns: Column<TransakcijaWithBalance>[] = [
  {
    key: "title",
    header: "Naziv",
    width: "25%",
    render: (t) => (
      <Link href={`/transakcije/${t.id}`} className="text-blue-600 hover:underline">
        {t.title}
      </Link>
    ),
  },
  {
    key: "created",
    header: "Datum",
    render: (t) =>
      new Date(t.created).toLocaleDateString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
  },
  {
    key: "type",
    header: "Tip",
    render: (t) => <StatusBadge status={t.type ?? "unknown"} />,
  },
  {
    key: "amount",
    header: "Iznos",
    align: "right",
    render: (t) => formatRSD(t.amount),
  },
  {
    key: "balance",
    header: "Stanje",
    align: "right",
    render: (t) => formatRSD(t.balance),
  },
  {
    key: "actions",
    header: "Akcije",
    align: "center",
    width: "90px",
    isAction: true,
    render: (t) => (
      <div className="flex gap-2 justify-center">
        <Link href={`/transakcije/${t.id}`} className="text-blue-600 hover:text-blue-800" title="View"><FaEye /></Link>
        <Link href={`/transakcije/${t.id}/edit`} className="text-yellow-600 hover:text-yellow-800" title="Edit"><FaEdit /></Link>
        <button className="text-red-600"><FaTrash /></button>
      </div>
    ),
  },
];

import { Column } from "@/components/table/types";
import type { Prostor } from "@/types/prostor";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

function skratiTip(tip: string | null | undefined) {
  if (!tip) return "-";

  return tip
    .trim()
    .split(/\s+/)
    .map((rec) => rec.charAt(0).toUpperCase())
    .join("");
}

export const prostoriColumns: Column<Prostor>[] = [

  {
    key: "title",
    header: "Broj",
    render: (prostor) => (
      <Link
        href={`/prostori/${prostor.id}`}
        className="hover:underline"
        title={prostor.title}
      >
        {skratiTip(prostor.tip)}{prostor.broj_prostora ?? "-"}
      </Link>
    ),
  },

  {
    key: "tip",
    header: "Tip",
    render: (prostor) => <span>{prostor.tip ?? "-"}</span>,
  },

  {
    key: "sprat",
    header: "Sprat",
    render: (prostor) => <span>{prostor.sprat ?? "-"}</span>,
  },

  //{
  //  key: "stan",
  //  header: "Stan",
  //  render: (prostor) => <span>{prostor.broj_prostora ?? "-"}</span>,
  //},

  {
    key: "povrsina",
    header: "Površina",
    render: (prostor) => (
      <span>
        {prostor.kvadratura != null
          ? `${Number(prostor.kvadratura).toLocaleString("sr-Latn-RS")} m²`
          : "-"}
      </span>
    ),
  },

  {
    key: "stanari",
    header: "Stanari",
    render: (prostor) => <span>{prostor.broj_stanara ?? "-"}</span>,
  },
];

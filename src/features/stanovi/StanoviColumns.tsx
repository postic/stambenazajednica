import { Column } from "@/components/table/types";
import type { Stan } from "@/types/stan";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import { toRoman } from "@/lib/text";

export const stanoviColumns: Column<Stan>[] = [
  {
    key: "title",
    header: "Tip",
    render: (stan) => (
      <Link
        href={`/stanovi/${stan.id}`}
        className="hover:underline"
        title={stan.title}
      >
        {stan.tip_prostora ?? ""}
      </Link>
    ),
  },

  {
    key: "vlasnik",
    header: "Korisnik",
    render: (stan) => <span>{stan.vlasnik ?? "-"}</span>,
  },

  {
    key: "stanari",
    header: "Stanari",
    render: (stan) => <span>{stan.broj_stanara ?? "-"}</span>,
  },

  {
    key: "sprat",
    header: "Sprat",
    render: (stan) => {
      const sprat =
        typeof stan.sprat === "number"
          ? toRoman(stan.sprat)
          : stan.sprat != null
            ? toRoman(Number(stan.sprat))
            : null;

      return <span>{sprat ?? "-"}</span>;
    },
  },

  {
    key: "povrsina",
    header: "Površina",
    render: (stan) => (
      <span>
        {stan.kvadratura != null
          ? `${Number(stan.kvadratura).toLocaleString("sr-Latn-RS")} m²`
          : "-"}
      </span>
    ),
  },
];

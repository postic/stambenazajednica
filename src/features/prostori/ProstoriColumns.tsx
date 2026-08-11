import { Column } from "@/components/table/types";
import type { Prostor } from "@/types/prostor";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import { toRoman } from "@/lib/text";

const TIP_PROSTORA = {
  stan: "S",
  poslovni_prostor: "PP",
};

export const prostoriColumns: Column<Prostor>[] = [

  {
    key: "title",
    header: "Korisnik",
    render: (prostor) => (
      <Link
        href={`/prostori/${prostor.id}`}
        className="hover:underline"
        title={prostor.title}
      >
        {prostor.title ?? "-"}
      </Link>
    ),
  },

  {
    key: "tip",
    header: "Tip",
    render: (prostor) => <span>{prostor.tip ?? "-"}</span>,
  },

  {
    key: "stanari",
    header: "Stanari",
    render: (prostor) => <span>{prostor.broj_stanara ?? "-"}</span>,
  },

  {
    key: "sprat",
    header: "Sprat",
    render: (prostor) => {
      const sprat =
        typeof prostor.sprat === "number"
          ? toRoman(prostor.sprat)
          : prostor.sprat != null
            ? toRoman(Number(prostor.sprat))
            : null;

      return <span>{sprat ?? "-"}</span>;
    },
  },

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
];

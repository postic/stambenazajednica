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
    header: "Tip",
    render: (prostor) => (
      <Link
        href={`/prostori/${prostor.id}`}
        className="hover:underline"
        title={prostor.title}
      >
        {prostor.broj_stanara ?? "-"}
      </Link>
    ),
  },

  {
    key: "vlasnik",
    header: "Korisnik",
    render: (prostor) => <span>{prostor.vlasnik ?? "-"}</span>,
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

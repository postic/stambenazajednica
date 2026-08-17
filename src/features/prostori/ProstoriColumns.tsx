import { Column } from "@/components/table/types";
import type { Prostor } from "@/types/prostor";
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
    key: "redni_broj",
    header: "#",
    render: (prostor) => (
      <Link
        href={`/prostori/${prostor.id}`}
        className="hover:underline"
        title={prostor.title}
      >
        {skratiTip(prostor.tip)}
        {prostor.broj_prostora ?? prostor.redniBroj}
      </Link>
    ),
  },

  {
    key: "title",
    header: "Stan",
    render: (prostor) => (
      <span>{prostor.broj_prostora ?? "-"}</span>
    ),
  },

  {
    key: "sprat",
    header: "Sprat",
    render: (prostor) => (
      <span>{prostor.sprat ?? "-"}</span>
    ),
  },

  {
    key: "korisnik",
    header: "Korisnik",
    render: (prostor) => (
      <span>{prostor.korisnik ?? "-"}</span>
    ),
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

  {
    key: "stanari",
    header: "Članova",
    render: (prostor) => (
      <span>{prostor.broj_stanara ?? "-"}</span>
    ),
  },
];

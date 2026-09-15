import { Column } from "@/components/table/types";
import type { Prostor } from "@/types/prostor";

function skratiTip(tip: string | null | undefined) {
  if (!tip) {
    return "";
  }

  const value = tip.toLowerCase();

  if (value.includes("stan")) {
    return "S";
  }

  if (value.includes("lokal")) {
    return "L";
  }

  if (value.includes("gara")) {
    return "G";
  }

  return tip.charAt(0).toUpperCase();
}

export const prostoriColumns: Column<Prostor>[] = [
  {
    key: "title",
    header: "Stan",
    render: (prostor) => (
      <span>
        {prostor.prostor_stan
          ? `${skratiTip(prostor.tip)}${prostor.prostor_stan}`
          : "-"}
      </span>
    ),
  },

  {
    key: "sprat",
    header: "Sprat",
    render: (prostor) => (
      <span>
        {prostor.sprat ?? "-"}
      </span>
    ),
  },

  {
    key: "korisnik",
    header: "Korisnik",
    render: (prostor) => (
      <span>
        {prostor.korisnik ?? "-"}
      </span>
    ),
  },

  {
    key: "povrsina",
    header: "Površina",
    render: (prostor) => (
      <span>
        {prostor.kvadratura != null
          ? `${Number(prostor.kvadratura).toLocaleString(
              "sr-Latn-RS"
            )} m²`
          : "-"}
      </span>
    ),
  },

  {
    key: "stanari",
    header: "Članova",
    render: (prostor) => (
      <span>
        {prostor.broj_stanara ?? "-"}
      </span>
    ),
  },
];

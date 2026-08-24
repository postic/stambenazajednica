import { Column } from "@/components/table/types";
import type { Obavestenje } from "@/types/obavestenje";
import Link from "next/link";

export const obavestenjaColumns: Column<Obavestenje>[] = [
  {
    key: "title",
    header: "Naslov",
    render: (o) => (
      <Link
        href={`/obavestenja/${o.id}`}
        className="hover:underline"
        title={o.title}
      >
        {o.title}
      </Link>
    ),
  },

  {
    key: "author",
    header: "Autor",
    render: (o) => o.author ?? "—",
  },

  {
    key: "date",
    header: "Datum",
    render: (o) =>
      new Date(o.created).toLocaleDateString(
        "sr-Latn-RS",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ),
  },
];

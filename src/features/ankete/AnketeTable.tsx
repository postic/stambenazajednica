import { DataTable } from "@/components/table/DataTable";
import { anketeColumns } from "./AnketeColumns";
import { Anketa } from "./types";

interface AnketeTableProps {
  ankete?: Anketa[];
}

export default function AnketeTable({ ankete = [] }: AnketeTableProps) {
  return (
    <DataTable
      data={ankete}
      columns={anketeColumns}
      emptyMessage="Nema anketa."
    />
  );
}

import { DataTable } from "@/components/table/DataTable";
import { anketeColumns } from "./AnketeColumns";
import type { Anketa } from "@/types/anketa";

interface AnketeTableProps {
  ankete?: Anketa[] | null;
  loading?: boolean;
}

export default function AnketeTable({
  ankete,
  loading = false,
}: AnketeTableProps) {
  const safeData = ankete ?? [];

  return (
    <DataTable<Anketa>
      loading={loading}
      data={safeData}
      columns={anketeColumns}
      emptyMessage={
        loading ? "Učitavanje..." : "Nema podataka."
      }
    />
  );
}

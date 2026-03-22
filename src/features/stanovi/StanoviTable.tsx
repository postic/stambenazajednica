import { DataTable } from "@/components/table/DataTable";
import { stanoviColumns } from "./StanoviColumns";
import { Stan } from "./types";

interface StanoviTableProps {
  stanovi?: Stan[];
}

export default function StanoviTable({ stanovi = [] }: StanoviTableProps) {
  return (
    <DataTable
      data={stanovi}
      columns={stanoviColumns}
      emptyMessage="Nema stanova."
    />
  );
}

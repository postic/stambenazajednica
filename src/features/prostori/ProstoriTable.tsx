"use client";

import { DataTable } from "@/components/table/DataTable";
import { prostoriColumns } from "./ProstoriColumns";
import type { Prostor } from "@/types/prostor";

interface ProstoriTableProps {
  prostori?: Prostor[];
  loading?: boolean;
}

export default function ProstoriTable({
  prostori,
  loading = false,
}: ProstoriTableProps) {
  const safeData = prostori ?? [];

  return (
    <DataTable<Prostor>
      loading={loading}
      data={safeData}
      columns={prostoriColumns}
    />
  );
}

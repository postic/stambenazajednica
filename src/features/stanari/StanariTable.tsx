import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { stanariColumns } from "@/features/stanari/StanariColumns";
import type { Stanar } from "@/types/stanar";

interface StanariTableProps {
  stanari?: Stanar[];
  loading?: boolean;
}

export default function StanariTable({
  stanari,
  loading = false,
}: StanariTableProps) {
  const safeData = stanari ?? [];

  return (
    <DataTable<Stanar>
      loading={loading}
      data={safeData}
      columns={stanariColumns}
    />
  );
}

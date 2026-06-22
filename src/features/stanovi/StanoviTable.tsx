"use client";

import { DataTable } from "@/components/table/DataTable";
import { stanoviColumns } from "./StanoviColumns";
import type { Stan } from "@/types/stan";

interface StanoviTableProps {
  stanovi?: Stan[];
  loading?: boolean;
}

export default function StanoviTable({
  stanovi,
  loading = false,
}: StanoviTableProps) {
  const safeData = stanovi ?? [];

  return (
    <DataTable<Stan>
      loading={loading}
      data={safeData}
      columns={stanoviColumns}
    />
  );
}

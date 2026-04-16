// src/components/SedniceTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { sedniceColumns } from "@/features/sednice/SedniceColumns";
import type { Sednica } from "@/types/sednica";

interface SedniceTableProps {
  sednice?: Sednica[] | null;
  loading?: boolean;
}

export default function SedniceTable({
  sednice,
  loading = false,
}: SedniceTableProps) {
  const safeData =sednice ?? [];

  return (
    <DataTable<Sednica>
      loading={loading}
      data={safeData}
      columns={sedniceColumns}
      emptyMessage={
        loading ? "Učitavanje..." : "Nema podataka."
      }
    />
  );
}

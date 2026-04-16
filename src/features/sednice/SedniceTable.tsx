// src/components/SedniceTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { sedniceColumns } from "@/features/sednice/SedniceColumns";
import type { Sednica } from "@/types/sednica";

interface SedniceTableProps {
  sednice?: Sednica[] | null;
  oading?: boolean;
}

export default function SednicaTable({
  sednice,
  loading = false,
}: SednicaTableProps) {
  const safeData =sednice ?? [];

  return (
    <DataTable<Sednica>
      loading={loading}
      data={safeData}
      columns={sednicaColumns}
      emptyMessage={
        loading ? "Učitavanje..." : "Nema podataka."
      }
    />
  );
}

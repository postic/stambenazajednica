"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { kvaroviColumns } from "@/features/kvarovi/KvaroviColumns";
import type { Kvar } from "@/types/kvar";

interface KvaroviTableProps {
  kvarovi?: Kvar[] | null;
  loading?: boolean;
}

export default function KvaroviTable({
  kvarovi,
  loading = false,
}: KvaroviTableProps) {
  const safeData = kvarovi ?? [];

  return (
    <DataTable<Kvar>
      loading={loading}
      data={safeData}
      columns={kvaroviColumns}
    />
  );
}

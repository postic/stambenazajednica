"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { telefoniColumns } from "@/features/telefoni/TelefoniColumns";
import type { Telefon } from "@/types/telefon";

interface TelefoniTableProps {
  telefoni?: Telefon[] | null;
  loading?: boolean;
}

export default function TelefoniTable({
  telefoni,
  loading = false,
}: TelefoniTableProps) {
  const safeData = telefoni ?? [];

  return (
    <DataTable<Telefon>
      loading={loading}
      data={safeData}
      columns={telefoniColumns}
    />
  );
}

// src/components/StanoviTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { Stan, stanoviColumns } from "@/features/stanovi/StanoviColumns";

interface StanoviTableProps {
  kvarovi?: Stan[];
}

export default function StanoviTable({ kvarovi = [] }: StanoviTableProps) {
  return (
    <DataTable
      data={stanovi}
      columns={stanoviColumns}
      emptyMessage="Nema prijavljenih stanova."
    />
  );
}

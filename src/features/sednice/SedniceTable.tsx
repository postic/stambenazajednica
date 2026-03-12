// src/components/SedniceTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { Sednica, sedniceColumns } from "@/features/sednice/SedniceColumns";

interface SedniceTableProps {
  sednice?: Sednica[];
}

export default function SedniceTable({ sednice = [] }: SedniceTableProps) {
  return (
    <DataTable
      data={sednice}
      columns={sedniceColumns}
      emptyMessage="Nema sednica."
    />
  );
}

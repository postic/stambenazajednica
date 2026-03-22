// src/components/SedniceTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { sedniceColumns } from "@/features/sednice/SedniceColumns";
import { Sednica } from "@/features/sednice/types";

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

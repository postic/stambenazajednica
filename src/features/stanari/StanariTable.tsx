// src/components/StanariTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { Stanar, stanariColumns } from "@/features/stanari/StanariColumns";

interface StanariTableProps {
  kvarovi?: Stanar[];
}

export default function StanariTable({ kvarovi = [] }: StanariTableProps) {
  return (
    <DataTable
      data={stanari}
      columns={stanariColumns}
      emptyMessage="Nema prijavljenih stanara."
    />
  );
}

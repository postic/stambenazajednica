// src/components/KvaroviTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { kvaroviColumns } from "@/features/kvarovi/KvaroviColumns";
import { Kvar } from "@/features/kvarovi/types";

interface KvaroviTableProps {
  kvarovi?: Kvar[];
}

export default function KvaroviTable({ kvarovi = [] }: KvaroviTableProps) {
  return (
    <DataTable
      data={kvarovi}
      columns={kvaroviColumns}
      emptyMessage="Nema prijavljenih kvarova."
    />
  );
}

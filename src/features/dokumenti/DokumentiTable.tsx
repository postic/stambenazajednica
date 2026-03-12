// src/components/DokumentiTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { Dokument, dokumentiColumns } from "@/features/dokumenti/DokumentiColumns";

interface DokumentiTableProps {
  dokumenti?: Dokument[];
}

export default function DokumentiTable({ dokumenti = [] }: DokumentiTableProps) {
  return (
    <DataTable
      data={dokumenti}
      columns={dokumentiColumns}
      emptyMessage="Nema dokumenata."
    />
  );
}

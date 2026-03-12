// src/components/ObavestenjaTable.tsx
"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { Obavestenja, obavestenjaColumns } from "@/features/obavestenja/ObavestenjaColumns";

interface ObavestenjaTableProps {
  obavestenja?: Obavestenja[];
}

export default function ObavestenjaTable({ obavestenja = [] }: ObavestenjaTableProps) {
  return (
    <DataTable
      data={obavestenja}
      columns={obavestenjaColumns}
      emptyMessage="Nema obaveštenja."
    />
  );
}

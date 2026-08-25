"use client";

import React from "react";
import { Dokument } from "@/types/dokument";
import { DataTable } from "@/components/table/DataTable"; // named export
import { dokumentiColumns } from "@/features/dokumenti/DokumentiColumns"; // ako je fajl sa velikim D

interface DokumentiTableProps {
  dokumenti: Dokument[];
}

export default function DokumentiTable({ dokumenti }: DokumentiTableProps) {
  return (
    <DataTable
      data={dokumenti}
      columns={dokumentiColumns}
    />
  );
}

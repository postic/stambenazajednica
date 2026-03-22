import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { stanariColumns } from "@/features/stanari/StanariColumns";
import { Stanar } from "@/features/stanari/types";

interface StanariTableProps {
  stanari?: Stanar[];
}

export default function StanariTable({ stanari = [] }: StanariTableProps) {
  return (
    <DataTable
      data={stanari}
      columns={stanariColumns}
      emptyMessage="Nema stanara."
    />
  );
}

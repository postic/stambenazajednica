import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { telefoniColumns } from "@/features/telefoni/TelefoniColumns";
import { Telefon } from "@/features/telefoni/types";

interface TelefoniTableProps {
  telefoni?: Telefon[];
}

export default function TelefoniTable({ telefoni = [] }: TelefoniTableProps) {
  return (
    <DataTable
      data={telefoni}
      columns={telefoniColumns}
      emptyMessage="Nema prijavljenih telefona."
    />
  );
}

"use client";

import { Table as ShadTable, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface TableProps {
  columns: string[];
  data: any[];
}

export default function Table({ columns, data }: TableProps) {
  return (
    <ShadTable>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col}>{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            {columns.map((col) => (
              <TableCell key={col}>{row[col]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </ShadTable>
  );
}

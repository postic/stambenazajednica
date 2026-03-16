"use client";

import React from "react";

export interface Column<T> {
  key: string;
  header: React.ReactNode; // može biti string ili JSX sa tooltip
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
}: DataTableProps<T>) {
  return (
    <table className="w-full border-collapse border text-sm">
  <thead className="bg-gray-100">
    <tr>
      {columns.map((col) => (
        <th
          key={col.key}
          className={`border px-4 py-2 ${
            col.key === "actions" ? "text-center" : "text-left"
          }`}
        >
          {col.header}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {data.map((item) => (
      <tr key={item.id ?? JSON.stringify(item)} className="hover:bg-gray-50">
        {columns.map((col) => (
          <td
            key={col.key}
            className={`border px-4 py-2 ${
              col.key === "actions" ? "text-center" : ""
            }`}
          >
            {col.render(item)}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
  );
}

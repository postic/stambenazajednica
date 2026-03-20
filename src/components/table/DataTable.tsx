"use client";

import React, { useState } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;

    if (sortKey === col.key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(col.key);
      setSortDirection("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === "number" && typeof valB === "number") return valA - valB;
      if (valA instanceof Date && valB instanceof Date) return valA.getTime() - valB.getTime();

      return String(valA).localeCompare(String(valB), undefined, { numeric: true });
    }).reverseIf(sortDirection === "desc");
  }, [data, sortKey, sortDirection]);

  // Pomoćna funkcija za reverz
  Array.prototype.reverseIf = function (condition: boolean) {
    return condition ? this.reverse() : this;
  };

  return (
    <table className="border-collapse border w-full text-sm">
      <thead className="bg-gray-100">
        <tr>
          {columns.map((col) => {
            const isSorted = sortKey === col.key;
            return (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className="border px-4 py-2 cursor-pointer select-none"
              >
                {col.header} {col.sortable && (isSorted ? (sortDirection === "asc" ? "▲" : "▼") : "⇅")}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, i) => (
          <tr
            key={i}
            className="hover:bg-gray-100 even:bg-gray-50" // <- ovo dodaje zebra striping
          >
            {columns.map((col) => (
              <td key={col.key} className="border px-4 py-2">
                {col.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

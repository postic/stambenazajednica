"use client";

import React, { useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  isAction?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string; // 👈 MORA da postoji
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

    const sorted = [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return valA - valB;
      }

      return String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
      });
    });

    return sortDirection === "desc" ? sorted.reverse() : sorted;
  }, [data, sortKey, sortDirection]);

  return (
    <>
      {/* ✅ DESKTOP TABLE */}
      <div className="hidden md:block">
        <table className="border-collapse border w-full text-sm table-fixed">
          <colgroup>
            {columns.map((col) => (
              <col
                key={col.key}
                style={{
                  width: col.width || (col.isAction ? "90px" : "auto"),
                }}
              />
            ))}
          </colgroup>

          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;

                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    className={`border py-2 text-left select-none ${
                      col.sortable ? "cursor-pointer px-4" : "px-4"
                    } ${col.isAction ? "text-center px-2" : ""}`}
                  >
                    {col.header}{" "}
                    {col.sortable &&
                      (isSorted
                        ? sortDirection === "asc"
                          ? "▲"
                          : "▼"
                        : "⇅")}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-100 even:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`border py-2 ${
                      col.isAction
                        ? "text-center px-2 whitespace-nowrap"
                        : "px-4"
                    }`}
                  >
                    {col.isAction ? (
                      <div className="flex items-center justify-center gap-1">
                        {col.render(row)}
                      </div>
                    ) : (
                      col.render(row)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ MOBILE CARDS */}
      <div className="md:hidden space-y-3">
        {sortedData.map((row, i) => (
          <div
            key={i}
            className="border rounded-lg p-3 bg-white shadow-sm"
          >
            {columns.map((col) =>
              col.isAction ? null : (
                <div
                  key={col.key}
                  className="flex justify-between py-1"
                >
                  <span className="text-gray-500 text-sm">
                    {col.header}
                  </span>
                  <span className="font-medium text-right">
                    {col.render(row)}
                  </span>
                </div>
              )
            )}

            {/* akcije dole */}
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t">
              {columns
                .filter((c) => c.isAction)
                .map((col) => col.render(row))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

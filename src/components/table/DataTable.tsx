// src/components/table/DataTable.tsx
"use client";

import React from "react";

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  // Opcionalno: da li je kolona akcija (da bi se spustila na mobile)
  isAction?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  emptyMessage = "Nema podataka.",
  className = "",
}: DataTableProps<T>) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-gray-500 text-center">{emptyMessage}</p>;
  }

  // Kolone koje nisu akcije (za mobile redove)
  const normalColumns = columns.filter((col) => !col.isAction);
  // Kolone koje su akcije (za mobile buttons row)
  const actionColumns = columns.filter((col) => col.isAction);

  return (
    <div className={`overflow-x-auto max-w-6xl mx-auto ${className}`}>
      {/* DESKTOP TABLE */}
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg hidden md:table">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item: any, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2">
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* MOBILE STACKED CARDS */}
      <div className="md:hidden mt-4 space-y-3">
        {data.map((item: any, idx) => (
          <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
            {normalColumns.map((col) => (
              <div key={col.key} className="mb-1">
                <span className="font-medium">{col.label}:</span>{" "}
                <span>{col.render(item)}</span>
              </div>
            ))}
            {actionColumns.length > 0 && (
              <div className="flex gap-3 overflow-x-auto mt-2">
                {actionColumns.map((col) => (
                  <React.Fragment key={col.key}>{col.render(item)}</React.Fragment>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

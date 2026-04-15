"use client";

import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface HasId {
  id: string | number;
}

interface DataTableProps<T extends HasId> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends HasId>({
  data,
  columns,
  emptyMessage = "Nema podataka.",
  loading = false,
}: DataTableProps<T>) {
  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="w-full py-6 text-sm text-gray-500 text-center">
        <span className="animate-pulse">Podaci se učitavaju...</span>
      </div>
    );
  }

  // =========================
  // EMPTY
  // =========================
  if (!data || data.length === 0) {
    return (
      <div className="w-full border p-6 text-sm text-gray-500 text-center">
        {emptyMessage}
      </div>
    );
  }

  const getAlignClass = (align?: string) => {
    switch (align) {
      case "right":
        return "text-right";
      case "center":
        return "text-center";
      default:
        return "text-left";
    }
  };

  // =========================
  // TABLE
  // =========================
  return (
    <div className="w-full overflow-x-auto border">
      <table className="w-full text-sm border-collapse">

        {/* HEADER */}
        <thead className="bg-white">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 font-medium text-gray-700
                  border border-gray-200
                  ${getAlignClass(col.align)}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 even:bg-gray-50/40"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`
                    px-4 py-3 border border-gray-200
                    ${getAlignClass(col.align)}
                  `}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

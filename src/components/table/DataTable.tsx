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

  if (loading) {
    return (
      <div className="w-full py-6 text-sm text-gray-500 text-center">
        <span className="animate-pulse">Podaci se učitavaju...</span>
      </div>
    );
  }

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

  return (
    <div className="w-full">

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block w-full overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">

          <thead className="bg-gray-50">
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

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-3">

        {data.map((row) => (
          <div
            key={row.id}
            className="border rounded-lg bg-white shadow-sm p-3"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex justify-between gap-4 py-1 border-b last:border-0"
              >
                <span className="text-gray-500 text-sm">
                  {col.header}
                </span>

                <span className={`text-sm font-medium ${getAlignClass(col.align)}`}>
                  {col.render(row)}
                </span>
              </div>
            ))}
          </div>
        ))}

      </div>

    </div>
  );
}

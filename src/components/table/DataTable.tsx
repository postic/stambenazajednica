"use client";

import React from "react";
import { Database } from "lucide-react";
import { Loader2 } from "lucide-react";

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
      <div className="w-full py-6 text-sm text-center bg-blue-50/40 border border-blue-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-9 h-9 text-blue-400 animate-spin" />
          <div className="text-blue-400 text-sm">Podaci se učitavaju...</div>
        </div>
      </div>
    );
  }

if (!data || data.length === 0) {
  return (
    <div className="w-full py-6 text-sm text-center bg-red-50/40 border border-red-100 rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <Database className="w-9 h-9 text-gray-400" />
        <div className="text-gray-400 text-sm">
          Nema podataka
        </div>
      </div>
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
      <div className="hidden md:block w-full overflow-x-auto border border-gray-200">
        <table className="w-full text-sm border-collapse text-gray-800">

          {/* 🔥 ISTAKNUT HEADER */}
          <thead className="bg-gray-100 sticky top-0 z-10 border-b-2 border-gray-300">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wide
                    ${getAlignClass(col.align)}
                    ${index !== columns.length - 1 ? "border-r border-gray-200" : ""}
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
                className="
                  odd:bg-white
                  even:bg-gray-50/60
                  hover:bg-gray-100/70
                  transition-colors
                "
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`
                      px-4 py-3 border-b border-gray-200
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

      {/* ================= MOBILE (FLAT LIST) ================= */}
<div className="md:hidden border border-gray-200">

  {data.map((row, index) => (
    <div
      key={row.id}
      className={`
        px-3 py-2
        ${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
      `}
    >

      {columns.map((col, colIndex) => (
        <div
          key={col.key}
          className={`
            flex justify-between items-center gap-4 py-2
            ${colIndex !== columns.length - 1 ? "border-b border-gray-200" : ""}
          `}
        >
          {/* LABEL */}
          <span className="text-gray-400 text-[11px] uppercase font-normal tracking-normal">
            {col.header}
          </span>

          {/* VALUE */}
          <span className={`text-sm text-gray-800 ${getAlignClass(col.align)}`}>
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

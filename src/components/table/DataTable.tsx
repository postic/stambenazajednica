"use client";

import React from "react";
import Link from "next/link";
import { Database, Loader2 } from "lucide-react";

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
  loading?: boolean;
  getRowHref?: (row: T) => string;
}

export function DataTable<T extends HasId>({
  data,
  columns,
  loading = false,
  getRowHref,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full py-6 text-sm text-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />

          <div className="text-gray-400 text-sm">
            Podaci se učitavaju...
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-6 text-sm text-center">
        <div className="flex flex-col items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" />

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

      {/* ==================================================
          DESKTOP
          ================================================== */}
      <div className="hidden md:block w-full overflow-x-auto border border-gray-200">
        <table className="w-full text-sm border-collapse text-gray-800">

          <thead className="bg-gray-100 sticky top-0 z-10 border-b-2 border-gray-300">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-2
                    font-semibold
                    text-gray-700
                    text-xs
                    uppercase
                    tracking-wide
                    ${getAlignClass(col.align)}
                    ${
                      index !== columns.length - 1
                        ? "border-r border-gray-200"
                        : ""
                    }
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row) => {
              const href = getRowHref?.(row);

              return (
                <tr
                  key={row.id}
                  className="
                    odd:bg-white
                    even:bg-gray-50/60
                  "
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`
                        p-0
                        border-b border-gray-200
                        ${getAlignClass(col.align)}
                      `}
                    >
                      {href ? (
                        <Link
                          href={href}
                          title="Otvori"
                          className="
                            block
                            w-full
                            h-full
                            px-4
                            py-3
                            !text-gray-800
                            !no-underline
                            hover:!text-[#059669]
                            hover:!no-underline
                            transition-colors
                            duration-150
                            visited:!text-gray-800
                            active:!text-[#059669]
                            focus:!text-gray-800
                          "
                        >
                          {col.render(row)}
                        </Link>
                      ) : (
                        <div className="px-4 py-3">
                          {col.render(row)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* ==================================================
          MOBILE
          ================================================== */}
      <div className="md:hidden border border-gray-200">

        {data.map((row, index) => {
          const href = getRowHref?.(row);

          const card = (
            <div
              className={`
                px-3
                py-2
                ${
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50/60"
                }
              `}
            >
              {columns.map((col, colIndex) => (
                <div
                  key={col.key}
                  className={`
                    flex
                    justify-between
                    items-center
                    gap-4
                    py-2
                    ${
                      colIndex !== columns.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }
                  `}
                >
                  <span className="text-gray-400 text-[11px] uppercase font-normal tracking-normal">
                    {col.header}
                  </span>

                  <div className="flex-1 flex justify-end text-sm text-gray-800">
                    <div className="text-right">
                      {col.render(row)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );

          if (!href) {
            return (
              <div key={row.id}>
                {card}
              </div>
            );
          }

          return (
            <Link
              key={row.id}
              href={href}
              title="Otvori"
              className="
                block
                !text-gray-800
                !no-underline
                hover:!text-[#059669]
                active:!text-[#059669]
                active:bg-gray-100
                hover:!no-underline
                active:!no-underline
                transition-colors
                duration-150
                visited:!text-gray-800
                focus:!text-gray-800
              "
            >
              {card}
            </Link>
          );
        })}

      </div>
    </div>
  );
}

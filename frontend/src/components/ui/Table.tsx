"use client";

import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = "Tidak ada data.",
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-muted">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-cream-darker">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-cream-darker bg-cream-dark/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-muted ${col.className ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-darker/60">
          {data.map((row, idx) => (
            <tr
              key={(row.id as string) ?? idx}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors ${
                onRowClick ? "cursor-pointer hover:bg-cream-dark/30" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-ink-soft ${col.className ?? ""}`}>
                  {col.render ? col.render(row, idx) : (row[col.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Hidden below `sm` — reserve for secondary columns so mobile keeps only
   *  the essential ones without introducing a second, separate mobile
   *  layout. */
  hideOnMobile?: boolean;
  className?: string;
}

/**
 * Presentational, server-renderable table. Sorting/filtering/pagination are
 * driven by the URL (see SearchInput/FilterDropdown/Pagination) and applied
 * by the caller's Prisma query — this component only renders whatever rows
 * it's given. The horizontal scroll lives on the table's own wrapper, so a
 * wide table never forces the page itself to scroll sideways.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyTitle = "No results",
  emptyDescription,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 ${
                  column.hideOnMobile ? "hidden sm:table-cell" : ""
                } ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-sm text-gray-700 ${column.hideOnMobile ? "hidden sm:table-cell" : ""} ${
                    column.className ?? ""
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

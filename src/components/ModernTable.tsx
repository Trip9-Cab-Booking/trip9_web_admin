// components/ModernTable.tsx
import React, { useMemo, useState } from "react";

export type Column<T> = {
  key: string; // property in data
  header: React.ReactNode;
  width?: string; // tailwind width classes or percent/px (e.g. "w-40" or "120px")
  sortable?: boolean;
  render?: (row: T) => React.ReactNode; // custom renderer for this column
  className?: string;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  // optional client-side search (filters rows by JSON string)
  enableSearch?: boolean;
  searchPlaceholder?: string;
  // pagination (if omitted, no pagination controls)
  page?: number;
  pageSize?: number;
  total?: number; // total available (for server side)
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // sorting (if provided, will call onSort instead of client-side sort)
  onSort?: (sort: SortState) => void;
  // optional fixed height for internal scroll area (e.g. "480px" or undefined for auto)
  height?: string;
  // optional actions cell renderer receiving row
  actions?: (row: T) => React.ReactNode;
  // accessible row id getter
  getRowId?: (row: T) => string;
  // className overrides
  className?: string;
};

function Chevron({ dir }: { dir?: "asc" | "desc" | null }) {
  return (
    <span className="inline-block ml-1 align-middle">
      {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "⇵"}
    </span>
  );
}

export default function ModernTable<T extends Record<string, any>>(props: Props<T>) {
  const {
    columns,
    data,
    loading = false,
    enableSearch = true,
    searchPlaceholder = "Search...",
    page = 1,
    pageSize = 10,
    total,
    onPageChange,
    onPageSizeChange,
    onSort,
    height,
    actions,
    getRowId,
    className,
  } = props;

  const [internalSearch, setInternalSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);

  // local sort / search only if user didn't provide server-side handlers
  const isServerSideSort = typeof onSort === "function";
  const isServerSidePagination = typeof onPageChange === "function" && typeof total === "number";

  const filtered = useMemo(() => {
    let rows = data || [];
    if (enableSearch && internalSearch.trim()) {
      const q = internalSearch.trim().toLowerCase();
      rows = rows.filter((r) => {
        try {
          return JSON.stringify(r).toLowerCase().includes(q);
        } catch {
          return false;
        }
      });
    }
    // client-side sorting if onSort not provided
    if (!isServerSideSort && sort) {
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (av == null && bv == null) return 0;
        if (av == null) return sort.dir === "asc" ? -1 : 1;
        if (bv == null) return sort.dir === "asc" ? 1 : -1;
        if (typeof av === "number" && typeof bv === "number") {
          return sort.dir === "asc" ? av - bv : bv - av;
        }
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        if (as < bs) return sort.dir === "asc" ? -1 : 1;
        if (as > bs) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [data, internalSearch, sort, enableSearch, isServerSideSort]);

  // pagination slice for client-side
  const paged = useMemo(() => {
    if (isServerSidePagination) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, isServerSidePagination]);

  const displayedTotal = isServerSidePagination ? total! : filtered.length;
  const totalPages = Math.max(1, Math.ceil(displayedTotal / pageSize));

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    // compute new sort state
    let next: SortState = { key: col.key, dir: "asc" };
    if (sort && sort.key === col.key) {
      next = { key: col.key, dir: sort.dir === "asc" ? "desc" : "asc" };
    }
    setSort(next);
    if (isServerSideSort) {
      onSort?.(next);
    }
  };

  return (
    <div className={`rounded-lg bg-white shadow-sm border ${className ?? ""}`}>
      {/* header: search + summary */}
      <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          {enableSearch && (
            <input
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="px-3 py-2 border rounded-md shadow-sm text-sm w-64"
            />
          )}
          <div className="text-sm text-gray-600">
            {loading ? "Loading..." : `Showing ${paged.length} of ${displayedTotal}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 hidden md:inline">Rows:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange ? onPageSizeChange(Number(e.target.value)) : null}
            className="px-2 py-1 border rounded-md text-sm"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* table area */}
      <div className="w-full overflow-x-auto">
        <div
          className="min-w-full"
          style={height ? { height } : undefined}
        >
          <table className="table-auto w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap ${col.className ?? ""}`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <button
                      onClick={() => handleSort(col)}
                      className={`flex items-center gap-1 focus:outline-none ${col.sortable ? "cursor-pointer" : ""}`}
                      aria-sort={sort?.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <span>{col.header}</span>
                      {col.sortable && <Chevron dir={sort?.key === col.key ? sort.dir : null} />}
                    </button>
                  </th>
                ))}

                {actions && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </td>
                    ))}
                    {actions && <td className="px-4 py-4"><div className="h-8 w-16 bg-gray-200 rounded" /></td>}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-10 text-gray-500">
                    No data
                  </td>
                </tr>
              ) : (
                paged.map((row, rowIndex) => {
                  const rowId = getRowId ? getRowId(row) : `row-${rowIndex}`;
                  return (
                    <tr key={rowId} className="hover:bg-gray-50 transition-colors">
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 align-middle text-sm whitespace-nowrap ${col.className ?? ""}`}
                          style={col.width ? { width: col.width } : undefined}
                        >
                          {col.render ? col.render(row) : (row[col.key] ?? "—")}
                        </td>
                      ))}

                      {actions && <td className="px-4 py-3 align-middle text-sm whitespace-nowrap">{actions(row)}</td>}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* footer: pagination controls */}
      <div className="px-4 py-3 border-t bg-white flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange ? onPageChange(Math.max(1, page - 1)) : null}
            disabled={page <= 1}
            className="px-3 py-2 rounded-md border disabled:opacity-50 text-sm"
          >
            Previous
          </button>

          <input
            type="number"
            min={1}
            max={totalPages}
            value={page}
            onChange={(e) => onPageChange ? onPageChange(Math.min(totalPages, Math.max(1, Number(e.target.value || 1)))) : null}
            className="w-16 px-2 py-1 border rounded-md text-sm"
          />

          <button
            onClick={() => onPageChange ? onPageChange(Math.min(totalPages, page + 1)) : null}
            disabled={page >= totalPages}
            className="px-3 py-2 rounded-md border disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

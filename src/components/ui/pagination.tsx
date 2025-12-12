"use client";

import React from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  compact?: boolean;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  siblingCount = 1,
  showFirstLast = true,
  compact = false,
}: Props) {
  if (totalPages <= 1) return null;

  function createRange(start: number, end: number) {
    const range: number[] = [];
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  const left = Math.max(1, currentPage - siblingCount);
  const right = Math.min(totalPages, currentPage + siblingCount);

  const pages: (number | string)[] = [];

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push("...");
  }

  pages.push(...createRange(left, right));

  if (right < totalPages) {
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className={`flex items-center justify-between gap-3 ${compact ? "text-sm" : "text-base"}`}>
      <nav className="inline-flex items-center gap-1" aria-label="Pagination">
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border bg-white disabled:opacity-50"
            aria-label="Go to first page"
          >
            First
          </button>
        )}

        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded-md border bg-white disabled:opacity-50"
          aria-label="Previous page"
        >
          Prev
        </button>

        {pages.map((p, idx) => (
          <button
            key={String(p) + idx}
            onClick={() => typeof p === "number" && onPageChange(p)}
            disabled={p === "..."}
            aria-current={typeof p === "number" && p === currentPage ? "page" : undefined}
            className={`px-2 py-1 rounded-md border ${typeof p === "number" && p === currentPage ? "bg-indigo-600 text-white" : "bg-white"} ${p === "..." ? "cursor-default" : ""}`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded-md border bg-white disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>

        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border bg-white disabled:opacity-50"
            aria-label="Go to last page"
          >
            Last
          </button>
        )}
      </nav>
    </div>
  );
}

"use client";

import React from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  compact?: boolean;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  compact = false,
}: Props) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, currentPage - siblingCount);
  const end = Math.min(totalPages, currentPage + siblingCount);

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div
      className={`flex items-center justify-center gap-1 ${compact ? "text-sm" : "text-base"
        }`}
    >
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
      >
        Prev
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`px-3 py-1 rounded-md border transition-colors ${p === currentPage
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white hover:bg-gray-50"
            }`}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

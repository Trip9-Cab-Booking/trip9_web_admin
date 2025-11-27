import React from "react";

interface StatusBadgeProps {
  status: string | null | undefined;
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string }
> = {
  accepted:   { bg: "bg-green-100", text: "text-green-700" },
  completed:  { bg: "bg-green-200", text: "text-green-800" },
  cancelled:  { bg: "bg-red-100",   text: "text-red-700" },
  ongoing:    { bg: "bg-blue-100",  text: "text-blue-700" },
  requested:  { bg: "bg-yellow-100", text: "text-yellow-700" },
  pending:    { bg: "bg-yellow-100", text: "text-yellow-700" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
        —
      </span>
    );
  }

  const key = status.toLowerCase();

  const style = STATUS_STYLES[key] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${style.bg} ${style.text}`}
    >
      {status}
    </span>
  );
}

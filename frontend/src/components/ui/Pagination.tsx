"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const delta = 1; // pages before/after current

  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (rangeStart > 2) pages.push("...");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  const btnBase =
    "flex h-9 min-w-[2.25rem] items-center justify-center rounded text-sm font-medium transition-colors";

  return (
    <nav aria-label={t("pagination.navLabel")} className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`${btnBase} text-ink-muted hover:bg-cream-darker/40 disabled:cursor-not-allowed disabled:opacity-30`}
        aria-label={t("pagination.prevLabel")}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-ink-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${btnBase} ${
              p === currentPage
                ? "bg-forest-700 text-cream"
                : "text-ink-muted hover:bg-cream-darker/40"
            }`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${btnBase} text-ink-muted hover:bg-cream-darker/40 disabled:cursor-not-allowed disabled:opacity-30`}
        aria-label={t("pagination.nextLabel")}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface PaginationProps {
  meta: PaginationMeta;
  /** Current page (1-indexed) */
  page: number;
  onPageChange: (page: number) => void;
  /** Disable all controls while a fetch is in-flight */
  isFetching?: boolean;
  /** Label for the item count, e.g. "users". Defaults to "items". */
  itemLabel?: string;
}

/**
 * Reusable server-side pagination bar.
 *
 * Shows prev / page-number buttons / next controls. Collapses to ellipsis
 * for large page counts, keeping the first, last, and two neighbours of
 * the active page always visible.
 *
 * Returns null when `meta.totalPages <= 1`.
 *
 * Usage:
 * ```tsx
 * <Pagination meta={data.meta} page={page} onPageChange={setPage} isFetching={isFetching} itemLabel="users" />
 * ```
 */
export function Pagination({
  meta,
  page,
  onPageChange,
  isFetching = false,
  itemLabel = "items",
}: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);

  const visiblePages = pages
    .filter(
      (p) =>
        p === 1 ||
        p === meta.totalPages ||
        Math.abs(p - page) <= 1,
    )
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
      <span className="text-[11px] text-slate-500">
        Page {meta.page} of {meta.totalPages} &middot; {meta.total} {itemLabel}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!meta.hasPreviousPage || isFetching}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        {visiblePages.map((item, idx) =>
          item === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1 text-slate-400 text-xs select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPageChange(item as number)}
              disabled={isFetching}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
          disabled={!meta.hasNextPage || isFetching}
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

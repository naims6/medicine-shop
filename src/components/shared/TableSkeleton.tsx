import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

/**
 * Drop-in skeleton for table bodies.
 * Renders `rows` placeholder rows, each with `cols` shimmer cells.
 *
 * Usage — place inside a `<TableBody>`:
 * ```tsx
 * <TableBody>
 *   {loading ? <TableSkeleton rows={6} cols={5} /> : data.map(renderRow)}
 * </TableBody>
 * ```
 */
export function TableSkeleton({ rows = 6, cols = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-3 w-full max-w-[120px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

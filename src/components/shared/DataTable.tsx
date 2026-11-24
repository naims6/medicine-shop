import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmpty,
} from "@/components/ui/table";

export interface DataTableColumn {
  key: string;
  label: string;
  /** Extra classes for the <th> */
  className?: string;
}

interface DataTableProps<T> {
  /** Column header definitions */
  columns: DataTableColumn[];
  /** Row data */
  data: T[];
  /** Render a full <TableRow> for each item */
  renderRow: (item: T) => React.ReactNode;
  /** Shown while loading=true */
  loading?: boolean;
  /** Shown when data is empty and loading is false */
  emptyMessage?: string;
  /** Shows a thin top-bar pulse when true (background re-fetch) */
  fetching?: boolean;
  /** Optional footer slot — use for Pagination */
  footer?: React.ReactNode;
}

/**
 * Reusable typed data table wrapped in a Card.
 * Handles loading skeletons, empty state, and a footer slot automatically.
 *
 * ```tsx
 * <DataTable
 *   columns={[{ key: "name", label: "Name" }, { key: "role", label: "Role" }]}
 *   data={users}
 *   renderRow={(u) => <UserRow key={u.id} user={u} />}
 *   loading={isLoading}
 *   fetching={isFetching}
 *   emptyMessage="No users found."
 *   footer={<Pagination … />}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  renderRow,
  loading = false,
  emptyMessage = "No data found.",
  fetching = false,
  footer,
}: DataTableProps<T>) {
  return (
    <Card className="overflow-hidden p-0">
      {/* Background re-fetch indicator */}
      {fetching && !loading && (
        <div className="h-0.5 bg-emerald-500 animate-pulse" />
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-slate-50">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            /* Skeleton rows */
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton className="h-3 w-full max-w-[120px]" />
                  </td>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableEmpty colSpan={columns.length}>{emptyMessage}</TableEmpty>
          ) : (
            data.map(renderRow)
          )}
        </TableBody>
      </Table>

      {footer && <div className="border-t border-slate-100">{footer}</div>}
    </Card>
  );
}

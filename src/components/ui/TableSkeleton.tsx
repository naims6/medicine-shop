interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 6, cols = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="py-2.5 px-4">
              <div className="h-3 rounded bg-slate-100 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

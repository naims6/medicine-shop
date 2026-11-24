import React from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// ---- StatCard ----

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  href?: string;
  accentBorder?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  href,
  accentBorder,
}: StatCardProps) {
  const inner = (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
          {label}
        </span>
        <p className="text-base sm:text-lg font-bold font-mono mt-0.5 leading-tight truncate">
          {value}
        </p>
        <span className="text-[10px] text-slate-500 font-medium truncate block mt-0.5">
          {sub}
        </span>
      </div>
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );

  const base = "bg-white p-3.5 rounded-xl border shadow-xs transition-colors";
  const border = accentBorder
    ? `${base} ${accentBorder} hover:border-opacity-80`
    : `${base} border-slate-200`;

  if (href) {
    return (
      <Link href={href} className={`${border} block group cursor-pointer`}>
        {inner}
      </Link>
    );
  }
  return <div className={border}>{inner}</div>;
}

// ---- StatsSkeleton ----

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

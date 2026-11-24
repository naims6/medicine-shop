"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
  Calendar,
  CalendarDays,
  TrendingUp,
  Receipt,
  AlertTriangle,
  PackagePlus,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import { useDashboardSummary } from "@/hooks/dashboard/useDashboardSummary";
import { useSalesTrend } from "@/hooks/dashboard/useSalesTrend";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { StatCard, StatsSkeleton } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const summary = useDashboardSummary();
  const trendDay = useSalesTrend({ interval: "day", limit: 7 });
  const trendMonth = useSalesTrend({ interval: "month", limit: 12 });

  const s = summary.data;
  const isLoading = summary.isLoading;

  return (
    <div className="space-y-5 pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pharmacy Sales Overview
          </h2>
          <p className="text-xs text-slate-500">
            Real-time sales performance and inventory summary
          </p>
        </div>
        <Link
          href="/dashboard/pos"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>New Sale</span>
        </Link>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Today's Sales"
            value={
              <span className="text-emerald-700">
                {formatCurrency(s?.todaySalesAmount ?? 0)}
              </span>
            }
            sub={`${s?.todayTransactionsCount ?? 0} bills today`}
            icon={<Calendar className="w-4 h-4 text-emerald-600" />}
            iconBg="bg-emerald-50 border border-emerald-100"
          />
          <StatCard
            label="Weekly Sales"
            value={
              <span className="text-blue-700">
                {formatCurrency(s?.weeklySalesAmount ?? 0)}
              </span>
            }
            sub={`Last 7 days • ${s?.weeklyTransactionsCount ?? 0} bills`}
            icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
            iconBg="bg-blue-50 border border-blue-100"
          />
          <StatCard
            label="Monthly Sales"
            value={
              <span className="text-purple-700">
                {formatCurrency(s?.monthlySalesAmount ?? 0)}
              </span>
            }
            sub={`Last 30 days • ${s?.monthlyTransactionsCount ?? 0} bills`}
            icon={<CalendarDays className="w-4 h-4 text-purple-600" />}
            iconBg="bg-purple-50 border border-purple-100"
          />
          <StatCard
            label="Total Revenue"
            value={
              <span className="text-slate-900">
                {formatCurrency(s?.totalRevenue ?? 0)}
              </span>
            }
            sub={`${s?.totalTransactions ?? 0} total bills`}
            icon={<Receipt className="w-4 h-4 text-slate-600" />}
            iconBg="bg-slate-100 border border-slate-200"
          />
          <StatCard
            label="Total Owing (বাকি)"
            value={
              <span className="text-amber-700">
                {formatCurrency(s?.totalOwingAmount ?? 0)}
              </span>
            }
            sub={`${s?.owingTransactionsCount ?? 0} unpaid bills`}
            icon={<CircleDollarSign className="w-4 h-4 text-amber-600" />}
            iconBg="bg-amber-50 border border-amber-200"
            href="/dashboard/sales"
            accentBorder="border-amber-200 hover:border-amber-400"
          />
          <StatCard
            label="Inventory Alerts"
            value={<span className="text-rose-700">View →</span>}
            sub="Low stock & expiry watch"
            icon={<PackagePlus className="w-4 h-4 text-rose-600" />}
            iconBg="bg-rose-50 border border-rose-200"
            href="/dashboard/medicines"
            accentBorder="border-rose-200 hover:border-rose-400"
          />
        </div>
      )}

      {/* Chart section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart
            trendDay={trendDay.data ?? null}
            trendMonth={trendMonth.data ?? null}
            isLoading={trendDay.isLoading || trendMonth.isLoading}
          />
        </div>

        {/* Revenue summary panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue Summary</h3>
            <p className="text-xs text-slate-500">
              Aggregate performance at a glance
            </p>
          </div>

          <div className="flex-1 space-y-3">
            {[
              {
                label: "Today",
                amount: s?.todaySalesAmount ?? 0,
                count: s?.todayTransactionsCount ?? 0,
                color: "bg-emerald-500",
                textColor: "text-emerald-700",
              },
              {
                label: "Last 7 Days",
                amount: s?.weeklySalesAmount ?? 0,
                count: s?.weeklyTransactionsCount ?? 0,
                color: "bg-blue-500",
                textColor: "text-blue-700",
              },
              {
                label: "Last 30 Days",
                amount: s?.monthlySalesAmount ?? 0,
                count: s?.monthlyTransactionsCount ?? 0,
                color: "bg-purple-500",
                textColor: "text-purple-700",
              },
              {
                label: "All Time",
                amount: s?.totalRevenue ?? 0,
                count: s?.totalTransactions ?? 0,
                color: "bg-slate-400",
                textColor: "text-slate-700",
              },
            ].map((row) => {
              const max = s?.totalRevenue || 1;
              const pct = Math.min(100, (row.amount / max) * 100);
              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{row.label}</span>
                    {isLoading ? (
                      <Skeleton className="h-3 w-20" />
                    ) : (
                      <span className={`font-mono font-bold ${row.textColor}`}>
                        {formatCurrency(row.amount)}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    {!isLoading && (
                      <div
                        className={`h-full rounded-full ${row.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {isLoading ? "—" : `${row.count} transactions`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Owing highlight */}
          <Link
            href="/dashboard/sales"
            className="mt-auto p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between group hover:border-amber-400 transition-colors"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Outstanding (বাকি)
              </span>
              {isLoading ? (
                <Skeleton className="h-5 w-24 mt-1" />
              ) : (
                <p className="text-sm font-bold font-mono text-amber-800 mt-0.5">
                  {formatCurrency(s?.totalOwingAmount ?? 0)}
                </p>
              )}
              <span className="text-[10px] text-amber-600">
                {isLoading ? "—" : `${s?.owingTransactionsCount ?? 0} unpaid bills`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:underline">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Quick links row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            href: "/dashboard/medicines",
            icon: <PackagePlus className="w-4 h-4" />,
            label: "Medicines",
            sub: "Catalogue & batches",
            color: "text-emerald-700",
            bg: "bg-emerald-50 border-emerald-200",
          },
          {
            href: "/dashboard/sales",
            icon: <Receipt className="w-4 h-4" />,
            label: "Sales History",
            sub: "All transactions",
            color: "text-blue-700",
            bg: "bg-blue-50 border-blue-200",
          },
          {
            href: "/dashboard/returns",
            icon: <Clock className="w-4 h-4" />,
            label: "Returns",
            sub: "Refund processing",
            color: "text-purple-700",
            bg: "bg-purple-50 border-purple-200",
          },
          {
            href: "/dashboard/users",
            icon: <CircleDollarSign className="w-4 h-4" />,
            label: "Users",
            sub: "Staff management",
            color: "text-slate-700",
            bg: "bg-slate-100 border-slate-200",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs p-4 flex items-center gap-3 transition-colors group"
          >
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}
            >
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold truncate ${item.color}`}>{item.label}</p>
              <p className="text-[10px] text-slate-400 truncate">{item.sub}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 ml-auto transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
